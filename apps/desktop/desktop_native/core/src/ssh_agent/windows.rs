use bitwarden_russh::ssh_agent;
pub mod named_pipe_listener_stream;

use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};
use tokio::sync::Mutex;
use tokio_util::sync::CancellationToken;

use super::BitwardenDesktopAgent;

impl BitwardenDesktopAgent {
    pub async fn start_server(
        auth_request_tx: tokio::sync::mpsc::Sender<String>,
        auth_response_rx: Arc<Mutex<tokio::sync::mpsc::Receiver<bool>>>,
    ) -> Result<Self, anyhow::Error> {
        let agent_state = BitwardenDesktopAgent {
            keystore: ssh_agent::KeyStore(Arc::new(RwLock::new(HashMap::new()))),
            show_ui_request_tx: auth_request_tx,
            get_ui_response_rx: auth_response_rx,
            cancellation_token: CancellationToken::new(),
        };
        let stream = named_pipe_listener_stream::NamedPipeServerStream::new(
            agent_state.cancellation_token.clone(),
        );

        let cloned_agent_state = agent_state.clone();
        tokio::spawn(async move {
            let _ = ssh_agent::serve(
                stream,
                cloned_agent_state.clone(),
                cloned_agent_state.keystore.clone(),
                cloned_agent_state.cancellation_token.clone(),
            )
            .await;
        });
        Ok(agent_state)
    }
}
