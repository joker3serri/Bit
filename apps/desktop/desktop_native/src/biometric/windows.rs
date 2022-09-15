use anyhow::Result;
use windows::{
    core::{factory, HSTRING},
    Foundation::IAsyncOperation,
    Security::Credentials::UI::*,
    Win32::{
        Foundation::HWND,
        System::WinRT::IUserConsentVerifierInterop,
        UI::{
            Input::KeyboardAndMouse::{self, KEYEVENTF_EXTENDEDKEY, KEYEVENTF_KEYUP, VK_MENU},
            WindowsAndMessaging,
        },
    },
};

pub fn prompt(hwnd: Vec<u8>, message: String) -> Result<bool> {
    let h = isize::from_le_bytes(hwnd.clone().try_into().unwrap());
    let window = HWND(h);

    // The Windows Hello prompt is displayed inside the application window. For best result we
    //  should set the window to the foreground and focus it.
    set_focus(window);

    let interop = factory::<UserConsentVerifier, IUserConsentVerifierInterop>()?;
    let operation: IAsyncOperation<UserConsentVerificationResult> =
        unsafe { interop.RequestVerificationForWindowAsync(window, &HSTRING::from(message))? };
    let result = operation.get()?;

    match result {
        UserConsentVerificationResult::Verified => Ok(true),
        _ => Ok(false),
    }
}

pub fn available() -> Result<bool> {
    let ucv_available = UserConsentVerifier::CheckAvailabilityAsync()?.get()?;

    match ucv_available {
        UserConsentVerifierAvailability::Available => Ok(true),
        UserConsentVerifierAvailability::DeviceBusy => Ok(true), // TODO: Look into removing this and making the check more ad-hoc
        _ => Ok(false),
    }
}

fn set_focus(window: HWND) {
    let mut pressed = false;
    let bvk = VK_MENU.0 as u8;

    unsafe {
        // Simulate holding down Alt key to bypass windows limitations
        if KeyboardAndMouse::GetAsyncKeyState(VK_MENU.0 as i32) == 0 {
            pressed = true;
            KeyboardAndMouse::keybd_event(bvk, 0, KEYEVENTF_EXTENDEDKEY, 0);
        }
        WindowsAndMessaging::SetForegroundWindow(window);
        KeyboardAndMouse::SetFocus(window);
        if pressed {
            KeyboardAndMouse::keybd_event(bvk, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_prompt() {
        prompt(
            vec![0, 0, 0, 0, 0, 0, 0, 0],
            String::from("Hello from Rust"),
        )
        .unwrap();
    }

    #[test]
    fn test_available() {
        assert!(available().unwrap())
    }
}
