def filterDocs($parent):
  . as $in
  | if .flags.isPrivate or (.inheritedFrom != null and (($parent.comment.tags//empty | any(.tag == "inheritdoc")) | not)) then empty else . end
  | reduce keys_unsorted[] as $key
    ( {}; . + { ($key): (if $key == "children" then $in[$key] | map(filterDocs($in)) else $in[$key] end) } );

def filterDocs: filterDocs({});
