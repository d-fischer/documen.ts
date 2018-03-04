def filterDocs:
  . as $in
  | if .flags.isPrivate or .inheritedFrom != null then empty else . end
  | reduce keys_unsorted[] as $key
    ( {}; . + { ($key): (if $key == "children" then $in[$key] | map(filterDocs) else $in[$key] end) } );
