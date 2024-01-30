#![allow(non_snake_case)]

use swift_rs::{swift, Bool, SRString};
use anyhow::{bail, Result};

use crate::biometrics::{KeyMaterial, OsDerivedKey};

swift!(pub(crate) fn biometric_available() -> Bool);

swift!(pub(crate) fn biometric_evaluateAccessControl(reason: &SRString, fallback_message: &SRString) -> Bool);

pub struct BiometricBridge {}
impl BiometricBridge {
    pub fn available() -> bool {
        let value = unsafe { biometric_available() };
        return value.into();
    }

    pub fn evaluateAccessControl(_reason: &str, _fallback_message: &str) -> bool {
        let reason: SRString = _reason.into();
        let fallback_message: SRString = _fallback_message.into();
        return unsafe { biometric_evaluateAccessControl( &reason, &fallback_message) }.into();
    }
}

/// The MacOS implementation of the biometric trait.
pub struct Biometric {}

impl super::BiometricTrait for Biometric {
    fn prompt(_hwnd: Vec<u8>, _message: String, _fallback_message: Option<String>) -> Result<bool> {
        let fallback_message = _fallback_message.as_deref().unwrap_or("");
        Ok(BiometricBridge::evaluateAccessControl(&_message, fallback_message))
    }

    fn available() -> Result<bool> {
        Ok(BiometricBridge::available())
    }


    fn derive_key_material(_iv_str: Option<&str>) -> Result<OsDerivedKey> {
        bail!("platform not supported");
    }

    fn get_biometric_secret(
        _service: &str,
        _account: &str,
        _key_material: Option<KeyMaterial>,
    ) -> Result<String> {
        bail!("platform not supported");
    }

    fn set_biometric_secret(
        _service: &str,
        _account: &str,
        _secret: &str,
        _key_material: Option<super::KeyMaterial>,
        _iv_b64: &str,
    ) -> Result<String> {
        bail!("platform not supported");
    }
}
