import {
  ARGON2_ITERATIONS,
  ARGON2_MEMORY,
  ARGON2_PARALLELISM,
  KdfType,
  PBKDF2_ITERATIONS,
} from "../../../platform/enums/kdf-type.enum";

export type KdfConfig = PBKDF2KdfConfig | Argon2KdfConfig;

export class PBKDF2KdfConfig {
  kdfType: KdfType.PBKDF2_SHA256;
  iterations: number;

  constructor(iterations?: number) {
    this.iterations = iterations ?? PBKDF2_ITERATIONS.defaultValue;
  }

  validateKdfConfig(): void {
    if (!PBKDF2_ITERATIONS.inRange(this.iterations)) {
      throw new Error(
        `PBKDF2 iterations must be between ${PBKDF2_ITERATIONS.min} and ${PBKDF2_ITERATIONS.max}`,
      );
    }
  }
}

export class Argon2KdfConfig {
  kdfType: KdfType.Argon2id;
  iterations: number;
  memory: number;
  parallelism: number;

  constructor(iterations?: number, memory?: number, parallelism?: number) {
    this.iterations = iterations ?? ARGON2_ITERATIONS.defaultValue;
    this.memory = memory ?? ARGON2_MEMORY.defaultValue;
    this.parallelism = parallelism ?? ARGON2_PARALLELISM.defaultValue;
  }

  validateKdfConfig(): void {
    if (!ARGON2_ITERATIONS.inRange(this.iterations)) {
      throw new Error(
        `Argon2 iterations must be between ${ARGON2_ITERATIONS.min} and ${ARGON2_ITERATIONS.max}`,
      );
    }

    if (!ARGON2_MEMORY.inRange(this.memory)) {
      throw new Error(
        `Argon2 memory must be between ${ARGON2_MEMORY.min}mb and ${ARGON2_MEMORY.max}mb`,
      );
    }

    if (!ARGON2_PARALLELISM.inRange(this.parallelism)) {
      throw new Error(
        `Argon2 parallelism must be between ${ARGON2_PARALLELISM.min} and ${ARGON2_PARALLELISM.max}.`,
      );
    }
  }
}
