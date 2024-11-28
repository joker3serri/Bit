use std::sync::Arc;

use tokio::sync::Mutex;
use tokio_util::sync::CancellationToken;

use bitwarden_russh::ssh_agent::{self, Key};

#[cfg_attr(target_os = "windows", path = "windows.rs")]
#[cfg_attr(target_os = "macos", path = "unix.rs")]
#[cfg_attr(target_os = "linux", path = "unix.rs")]
mod platform_ssh_agent;

#[cfg(any(target_os = "linux", target_os = "macos"))]
mod peercred_unix_listener_stream;

pub mod generator;
pub mod importer;
pub mod peerinfo;
#[derive(Clone)]
pub struct BitwardenDesktopAgent {
    keystore: ssh_agent::KeyStore,
    cancellation_token: CancellationToken,
    show_ui_request_tx: tokio::sync::mpsc::Sender<SshAgentUIRequest>,
    get_ui_response_rx: Arc<Mutex<tokio::sync::broadcast::Receiver<(u32, bool)>>>,
    request_id: Arc<Mutex<u32>>,
    is_running: Arc<tokio::sync::Mutex<bool>>,
}

pub struct SshAgentUIRequest {
    pub request_id: u32,
    pub cipher_id: String,
    pub process_name: String,
    pub application_info: crate::ssh_agent::peerinfo::application_info::ApplicationInfo,
}

impl ssh_agent::Agent<peerinfo::models::PeerInfo> for BitwardenDesktopAgent {
    async fn confirm(&self, ssh_key: Key, info: &peerinfo::models::PeerInfo) -> bool {
        if !*self.is_running.lock().await {
            println!("[BitwardenDesktopAgent] Agent is not running, but tried to call confirm");
            return false;
        }

        let request_id = self.get_request_id().await;
        println!("[SSH Agent] Confirming request from application: {}", info.process_name());

        let mut rx_channel = self.get_ui_response_rx.lock().await.resubscribe();
        self.show_ui_request_tx
            .send(SshAgentUIRequest {
                request_id,
                cipher_id: ssh_key.cipher_uuid.clone(),
                process_name: info.process_name().to_string(),
                application_info: info.application_info()
            })
            .await
            .expect("Should send request to ui");
        while let Ok((id, response)) = rx_channel.recv().await {
            if id == request_id {
                return response;
            }
        }
        false
    }

    fn can_list(&self, info: &peerinfo::models::PeerInfo) -> impl std::future::Future<Output = bool> + Send {
        println!("[SSH Agent] List ssh keys request from application: {}", info.process_name());
        async { true }
    }
}

impl BitwardenDesktopAgent {
    pub fn stop(&self) {
        if !*self.is_running.blocking_lock() {
            println!("[BitwardenDesktopAgent] Tried to stop agent while it is not running");
            return;
        }

        *self.is_running.blocking_lock() = false;
        self.cancellation_token.cancel();
        self.keystore
            .0
            .write()
            .expect("RwLock is not poisoned")
            .clear();
    }

    pub fn set_keys(
        &mut self,
        new_keys: Vec<(String, String, String)>,
    ) -> Result<(), anyhow::Error> {
        if !*self.is_running.blocking_lock() {
            return Err(anyhow::anyhow!(
                "[BitwardenDesktopAgent] Tried to set keys while agent is not running"
            ));
        }

        let keystore = &mut self.keystore;
        keystore.0.write().expect("RwLock is not poisoned").clear();

        for (key, name, cipher_id) in new_keys.iter() {
            match parse_key_safe(&key) {
                Ok(private_key) => {
                    let public_key_bytes = private_key
                        .public_key()
                        .to_bytes()
                        .expect("Cipher private key is always correctly parsed");
                    keystore.0.write().expect("RwLock is not poisoned").insert(
                        public_key_bytes,
                        Key {
                            private_key: Some(private_key),
                            name: name.clone(),
                            cipher_uuid: cipher_id.clone(),
                        },
                    );
                }
                Err(e) => {
                    eprintln!("[SSH Agent Native Module] Error while parsing key: {}", e);
                }
            }
        }

        Ok(())
    }

    pub fn lock(&mut self) -> Result<(), anyhow::Error> {
        if !*self.is_running.blocking_lock() {
            return Err(anyhow::anyhow!(
                "[BitwardenDesktopAgent] Tried to lock agent, but it is not running"
            ));
        }

        let keystore = &mut self.keystore;
        keystore
            .0
            .write()
            .expect("RwLock is not poisoned")
            .iter_mut()
            .for_each(|(_public_key, key)| {
                key.private_key = None;
            });
        Ok(())
    }

    async fn get_request_id(&self) -> u32 {
        if !*self.is_running.lock().await {
            println!("[BitwardenDesktopAgent] Agent is not running, but tried to get request id");
            return 0;
        }

        let mut request_id = self.request_id.lock().await;
        *request_id += 1;
        *request_id
    }

    pub fn is_running(self) -> bool {
        return self.is_running.blocking_lock().clone();
    }
}

fn parse_key_safe(pem: &str) -> Result<ssh_key::private::PrivateKey, anyhow::Error> {
    match ssh_key::private::PrivateKey::from_openssh(pem) {
        Ok(key) => match key.public_key().to_bytes() {
            Ok(_) => Ok(key),
            Err(e) => Err(anyhow::Error::msg(format!(
                "Failed to parse public key: {}",
                e
            ))),
        },
        Err(e) => Err(anyhow::Error::msg(format!("Failed to parse key: {}", e))),
    }
}
