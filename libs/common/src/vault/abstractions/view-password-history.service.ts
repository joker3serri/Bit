import { CipherId } from "../../types/guid";
import { CipherView } from "../models/view/cipher.view";

/**
 * The ViewPasswordHistoryService is responsible for displaying the password history for a cipher.
 */
export abstract class ViewPasswordHistoryService<CipherOption extends CipherId | CipherView> {
  abstract viewPasswordHistory(cipherOption?: CipherOption): Promise<void>;
}
