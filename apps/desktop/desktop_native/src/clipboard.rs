use anyhow::Result;
use arboard::{Clipboard, Set};

pub fn read() -> Result<String> {
    let mut clipboard = Clipboard::new()?;

    Ok(clipboard.get_text()?)
}

pub fn write(text: &str, password: bool) -> Result<()> {
    let mut clipboard = Clipboard::new()?;

    let mut set = clipboard.set();

    if password {
        set = exclude_from_history(set);
    }

    set.text(text)?;
    Ok(())
}

// Exclude from windows clipboard history
#[cfg(target_os = "windows")]
fn exclude_from_history(set: Set) -> Set {
    use arboard::SetExtWindows;

    set.exclude_from_cloud().exclude_from_history()
}

// NOOP for other platforms
#[cfg(not(target_os = "windows"))]
fn exclude_from_history(set: Set) -> Set {
    set
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_write_read() {
        let message = "Hello world!";

        write(message, false).unwrap();
        assert_eq!(message, read().unwrap());
    }
}
