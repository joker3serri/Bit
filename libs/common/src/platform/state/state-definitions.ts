import { StateDefinition } from "./state-definition";

/**
 * `StateDefinition`s comes with some rules, to facilitate a quick review from
 * platform of this file, ensure you follow these rules, the ones marked with (tested)
 * have unit tests that you can run locally.
 *
 * 1. (tested) Names should not be null or undefined
 * 2. (tested) Name and storage location should be unique
 * 3. (tested) Name and storage location can't differ another export only by casing
 * 4. (tested) Name should be longer than a 3 characters (at least, it should be descriptive but brief)
 * 5. (tested) Name should not contain spaces or underscores
 * 6. Name should be human readable
 * 7. Name should be in camelCase format (unit tests ensure the first character is lowercase)
 * 8. Teams should only use state definitions they have created
 * 9. StateDefinitions should only be used for keys relating to the state name they chose
 *
 * We reserve the right to make up rules on the spot in PR review, but if you follow
 * these rules you will likely have a very speedy review from platform.
 */

export const ACCOUNT_MEMORY = new StateDefinition("account", "memory");
