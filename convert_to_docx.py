"""Convert markdown files to Word documents, grouped by module."""
import os
import subprocess
import re

ROOT = r"C:\Users\Administrator\Desktop\knowledge-base"
DOCS = os.path.join(ROOT, "docs")
OUTPUT = os.path.join(ROOT, "output")

MODULES = {
    "whitepaper": "01-装修白皮书",
    "standards": "02-施工规范",
    "models": "03-家装模式",
    "crafts": "04-工种工艺",
    "pricing": "05-报价预算",
    "inspection": "06-验收标准",
    "materials": "07-材料指南",
    "pitfalls": "08-避坑指南",
    "market": "09-市场分析",
    "enterprises": "10-龙头企业",
}


def collect_md_files(module_dir):
    """Collect all .md files, index first, then alphabetically."""
    files = []
    index_file = os.path.join(DOCS, module_dir, "index.md")
    if os.path.exists(index_file):
        files.append(index_file)
    for root, dirs, fnames in os.walk(os.path.join(DOCS, module_dir)):
        for f in sorted(fnames):
            if f == "index.md":
                continue
            if f.endswith(".md"):
                files.append(os.path.join(root, f))
    return files


def strip_frontmatter(text):
    """Remove YAML frontmatter between --- markers."""
    text = text.strip()
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            text = text[end + 3:].strip()
    return text


def merge_md_files(files):
    """Merge multiple md files into one, stripping frontmatter from non-index files."""
    parts = []
    for fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        # Strip frontmatter from all files for clean output
        content = strip_frontmatter(content)
        # Ensure file ends with two newlines
        content = content.rstrip() + "\n\n"
        parts.append(content)
    return "\n\n".join(parts)


def convert_to_docx(merged_text, output_path):
    """Use pandoc to convert merged markdown to docx."""
    cmd = [
        "pandoc",
        "-f", "markdown",
        "-t", "docx",
        "--wrap=auto",
        "--toc",
        "--toc-depth=3",
        "-o", output_path,
    ]
    proc = subprocess.run(
        cmd, input=merged_text.encode("utf-8"),
        capture_output=True, cwd=ROOT
    )
    if proc.returncode != 0:
        print(f"  ERROR: {proc.stderr.decode('utf-8', errors='replace')}")
        return False
    return True


def main():
    os.makedirs(OUTPUT, exist_ok=True)

    # Convert each module
    for module_dir, display_name in MODULES.items():
        module_path = os.path.join(DOCS, module_dir)
        if not os.path.isdir(module_path):
            print(f"SKIP: {module_dir} (not found)")
            continue

        files = collect_md_files(module_dir)
        if not files:
            print(f"SKIP: {module_dir} (no .md files)")
            continue

        print(f"Processing: {display_name} ({len(files)} files)...")
        merged = merge_md_files(files)

        out_file = os.path.join(OUTPUT, f"{display_name}.docx")
        success = convert_to_docx(merged, out_file)

        if success:
            size_kb = os.path.getsize(out_file) / 1024
            print(f"  -> {display_name}.docx ({size_kb:.0f} KB, {len(files)} articles)")
        else:
            print(f"  -> FAILED")

    # Also create a combined single document
    print("\nGenerating combined document...")
    all_merged = []
    for module_dir, display_name in MODULES.items():
        module_path = os.path.join(DOCS, module_dir)
        if not os.path.isdir(module_path):
            continue
        files = collect_md_files(module_dir)
        if files:
            merged = merge_md_files(files)
            all_merged.append(merged)

    combined_text = "\n\n" + "# " + "-" * 50 + "\n\n".join(all_merged)
    out_file = os.path.join(OUTPUT, "装修知识库-完整版.docx")
    if convert_to_docx(combined_text, out_file):
        size_kb = os.path.getsize(out_file) / 1024
        print(f"  -> 装修知识库-完整版.docx ({size_kb:.0f} KB)")
    else:
        print("  -> FAILED")

    print("\nDone! All files saved to:", OUTPUT)


if __name__ == "__main__":
    main()
