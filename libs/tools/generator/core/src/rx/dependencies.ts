import { Observable } from "rxjs";

import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { UserId } from "@bitwarden/common/types/guid";

export type UserChangedError = {
  expectedUserId: UserId;
  actualUserId: UserId;
};

/** A pattern for types that depend upon a dynamic policy stream and return
 *  an observable.
 *
 *  Consumers of this dependency should emit when `policy$`
 *  emits, provided that the latest message materially
 *  changes the output of the consumer. If `policy$` emits
 *  an unrecoverable error, the consumer should continue using
 *  the last-emitted policy. If `policy$` completes, the consumer
 *  should continue using the last-emitted policy.
 */
export type PolicyDependency = {
  /** A stream that emits policies when subscribed and
   *  when the policy changes. The stream should not
   *  emit null or undefined.
   */
  policy$: Observable<Policy[]>;
};

/** A pattern for types that depend upon a dynamic userid and return
 *  an observable.
 *
 * Consumers of this dependency should emit when `userId$` changes.
 * If `userId$` completes, the consumer should also complete. If
 * `userId$` emits an unrecoverable error, the consumer should
 * also emit the error.
 */
export type UserDependency = {
  /** A stream that emits a UserId when subscribed and when
   *  the userId changes. The stream should not emit null
   *  or undefined.
   */
  userId$: Observable<UserId>;
};

/** A pattern for types that depend upon a fixed userid and return
 *  an observable.
 *
 *  Consumers of this dependency should emit a `UserChangedError` if
 *  the value of `singleUserId$` changes. If `singleUserId$` completes,
 *  the consumer should also complete. If `singleUserId$` errors, the
 *  consumer should also emit the error.
 *
 *  @remarks Check the consumer's documentation to determine how it
 *  responds to repeat emissions.
 */
export type SingleUserDependency = {
  /** A stream that emits a UserId when subscribed and the user's account
   *  is unlocked, and completes when the account is locked or logged out.
   *  The stream should not emit null or undefined.
   */
  singleUserId$: Observable<UserId>;
};

type EmitMap<T> = T extends void
  ? { emitMap: never }
  : T extends boolean
    ? {
        /** Maps an arbitrary type T to a boolean. This method is required
         *  when T is not a boolean.
         */
        emitMap?: (value: T) => boolean;
      }
    : {
        /** Maps an arbitrary type T to a boolean. This method is required
         *  when T is not a boolean.
         */
        emitMap: (value: T) => boolean;
      };

/** A pattern for types that emit values exclusively when the dependency
 *  emits a message.
 *
 *  Consumers of this dependency should emit when `when$` emits a true
 *  value. If `when$` completes, the consumer should also complete. If `when$`
 *  errors, the consumer should also emit the error.
 *
 *  @remarks This dependency is useful when you have an algorithm that you
 *  would like to run when an event occurs. Use `WhenDependency<T>`
 *  when your consumer determines its own emission schedule.
 */
export type EmitDependency<T = void> = {
  /** A stream that emits the value to wait upon when subscribed. This
   *  stream should not emit undefined. When `T` is `void`, every emission
   *  triggers a consumer emission. When `T` is boolean, `true`
   *  emissions trigger an emission. When `T` is an arbitrary type,
   *  `emitMap` determines when
   */
  emit$: Observable<T>;
} & EmitMap<T>;

type WhenMap<T> = T extends boolean
  ? {
      /** Maps an arbitrary type T to a boolean. This method is required
       *  when T is not a boolean.
       */
      whenMap?: (value: T) => boolean;
    }
  : {
      /** Maps an arbitrary type T to a boolean. This method is required
       *  when T is not a boolean.
       */
      whenMap: (value: T) => boolean;
    };

/** A pattern for types that emit when a dependency is `true`.
 *
 *  Consumers of this dependency may emit when `when$` emits a true
 *  value. If `when$` completes, the consumer should also complete. If
 * `when$` errors, the consumer should also emit the error.
 *
 *  @remarks Check the consumer's documentation to determine how it
 *  responds to emissions.
 */
export type WhenDependency<T = boolean> = {
  /** The stream to observe for true emissions. */
  when$: Observable<T>;
} & WhenMap<T>;

/** A pattern for types that allow their managed settings to
 *  be overridden.
 *
 *  Consumers of this dependency should emit when `settings$`
 *  change. If `settings$` completes, the consumer should also
 *  complete. If `settings$` errors, the consumer should also
 *  emit the error.
 */
export type SettingsDependency<Settings> = {
  /** A stream that emits settings when settings become available
   *  and when they change. If the settings are not available, the
   *  stream should wait to emit until they become available.
   */
  settings$: Observable<Settings>;
};

/** A pattern for types that accept an arbitrary dependency and
 *  inject it into behavior-customizing functions.
 *
 *  Unlike most other dependency types, this interface does not
 *  functionally constrain the behavior of the consumer.
 *
 *  @remarks Consumers of this dependency wholly determine
 *  their response. Check the consumer's documentation
 *  to find this information.
 */
export type Dependencies<TCombine> = {
  dependencies$: TCombine;
};
