#!/bin/bash

# Function to copy report_menu.json files to the build directory
copy_report_menus() {
  local src_dir=$1
  local dest_dir=$2

  find "$src_dir" -name "report_menu.json" | while read -r file; do
    relative_path=$(dirname "${file#$src_dir/}")
    target_dir="$dest_dir/$relative_path"

    mkdir -p "$target_dir"
    cp "$file" "$target_dir"
    echo "Copied $file to $target_dir"
  done
}

# Define source and destination directories
src_dir="./apps"
dest_dir="./build"

# Copy report_menu.json files
copy_report_menus "$src_dir" "$dest_dir"