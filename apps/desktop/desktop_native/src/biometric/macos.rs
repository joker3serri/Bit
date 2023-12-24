use anyhow::{bail, Result};
use localauthentication_rs::{LocalAuthentication, LAPolicy};

use crate::biometrics::{KeyMaterial, OsDerivedKey};

/// The MacOS implementation of the biometric trait.
pub struct Biometric {}

impl super::BiometricTrait for Biometric {
    fn prompt(_hwnd: Vec<u8>, _message: String, fallback_message: Option<String>) -> Result<bool> {
        let local_authentication: LocalAuthentication = LocalAuthentication::new(fallback_message.as_deref());
        Ok(local_authentication.evaluate_policy(
            LAPolicy::DeviceOwnerAuthenticationWithBiometricsOrWatch,
            &_message,
        ))
    }

    fn available() -> Result<bool> {
        let local_authentication = LocalAuthentication::new(None);
        Ok(local_authentication.can_evaluate_policy(LAPolicy::DeviceOwnerAuthenticationWithBiometricsOrWatch))
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
