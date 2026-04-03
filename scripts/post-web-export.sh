#!/bin/bash
# Post-export script: patch web-dist2/index.html with emoji font + SPA rewrite
DIR="web-dist2"

# Add Noto Color Emoji font link
sed -i 's|<title>Enigma Language Adventure</title>|<title>Enigma Language Adventure</title>\n    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji\&display=swap" />|' "$DIR/index.html"

# Add emoji font-family to body
sed -i "s|body {|body {\n        font-family: system-ui, -apple-system, sans-serif, 'Noto Color Emoji';|" "$DIR/index.html"

# Add vercel.json for SPA routing
cat > "$DIR/vercel.json" <<'EOF'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF

echo "Post-export patches applied to $DIR"
