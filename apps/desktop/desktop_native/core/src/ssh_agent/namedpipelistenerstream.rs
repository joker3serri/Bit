use std::{io, pin::Pin, task::{Context, Poll}};

use futures::Stream;
use tokio::net::windows::named_pipe::{NamedPipeServer, ServerOptions};

const PIPE_NAME: &str = r"\\.\pipe\openssh-ssh-agent";

#[pin_project::pin_project]
pub struct NamedPipeServerStream {
    rx: tokio::sync::mpsc::Receiver<NamedPipeServer>,
}

impl NamedPipeServerStream {
    pub fn new() -> Self {
        let (tx, rx) = tokio::sync::mpsc::channel(16);
        tokio::spawn(async move {
            println!("[SSH Agent Native Module] Creating named pipe server on {}", PIPE_NAME);
            let mut listener = ServerOptions::new().create(PIPE_NAME).unwrap();
            loop {
                println!("[SSH Agent Native Module] Waiting for connection");
                listener.connect().await.unwrap();
                println!("[SSH Agent Native Module] Incoming connection");
                tx.send(listener).await.unwrap();
                listener = ServerOptions::new().create(PIPE_NAME).unwrap();
            }
        });
        Self {
            rx,
        }
    }
}

impl Stream for NamedPipeServerStream {
    type Item = io::Result<NamedPipeServer>;

    fn poll_next(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<io::Result<NamedPipeServer>>> {
        let this = self.project();

        match this.rx.poll_recv(cx) {
            Poll::Ready(Some(inner)) => {
                Poll::Ready(Some(Ok(inner)))
            },
            Poll::Ready(None) => Poll::Ready(None),
            Poll::Pending => Poll::Pending,
        }
    }
}
