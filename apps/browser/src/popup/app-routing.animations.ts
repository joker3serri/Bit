import {
  animate,
  AnimationMetadata,
  group,
  query,
  style,
  transition,
  trigger,
} from "@angular/animations";

/**
 * Routes can belong to one of three elevations that determine the router transition behavior.
 *
 * 0 - will not animate
 * 1 - will slide in and out from the left when navigating to/from elevation 0
 * 2 - will slide in and out from the bottom
 */
export type RouteElevation = 0 | 1 | 2;

const queryShown = query(
  ":enter, :leave",
  [style({ position: "fixed", width: "100%", height: "100%" })],
  {
    optional: true,
  },
);

// ref: https://github.com/angular/angular/issues/15477
const queryChildRoute = query("router-outlet ~ *", [style({}), animate(1, style({}))], {
  optional: true,
});

const speed = "0.4s";

type TranslateDirection = "enter" | "leave";
type TranslationAxis = "X" | "Y";

function queryTranslate(
  direction: TranslateDirection,
  axis: TranslationAxis,
  from: number,
  to: number,
  zIndex = 1000,
) {
  return query(
    ":" + direction,
    [
      style({
        transform: "translate" + axis + "(" + from + "%)",
        zIndex: zIndex,
        boxShadow: "0 3px 2px -2px gray",
      }),
      animate(
        speed + " ease-in-out",
        style({
          transform: "translate" + axis + "(" + to + "%)",
        }),
      ),
    ],
    {
      optional: true,
    },
  );
}

const animations = {
  slideInFromRight: [
    queryShown,
    group([
      queryTranslate("enter", "X", 100, 0, 1010),
      queryTranslate("leave", "X", 0, 0),
      queryChildRoute,
    ]),
  ],
  slideOutToRight: [
    queryShown,
    group([queryTranslate("enter", "X", 0, 0), queryTranslate("leave", "X", 0, 100, 1010)]),
  ],
  slideInFromTop: [
    queryShown,
    group([
      queryTranslate("enter", "Y", -100, 0, 1010),
      queryTranslate("leave", "Y", 0, 0),
      queryChildRoute,
    ]),
  ],
  slideOutToTop: [
    queryShown,
    group([queryTranslate("enter", "Y", 0, 0), queryTranslate("leave", "Y", 0, -100, 1010)]),
  ],
} satisfies Record<string, AnimationMetadata[]>;

export const routerTransition = trigger("routerTransition", [
  transition("0 => 2", animations.slideInFromTop),
  transition("1 => 2", animations.slideInFromTop),

  transition("2 => 0", animations.slideOutToTop),
  transition("2 => 1", animations.slideOutToTop),

  transition("0 => 1", animations.slideInFromRight),
  transition("1 => 0", animations.slideOutToRight),
]);
