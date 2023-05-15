#!/bin/bash
for p in libs/**/tsconfig.spec.json; do
  echo "Typechecking $p"
 tsc --noEmit --project $p
 res=$?

  if [[ $res != 0 ]]; then
    z=1
  fi
done
if [[ $z == 1 ]]; then
  exit 1
fi

