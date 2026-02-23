"""
read_pixel.py — Extract pixel coordinates from game screenshots.

Usage:
    python read_pixel.py <image_path> <x> <y>
    python read_pixel.py <image_path> --region x1 y1 x2 y2
    python read_pixel.py <image_path> --find-text-region

Examples:
    python read_pixel.py screenshot.png 457 176
    python read_pixel.py screenshot.png --region 370 170 580 195
    python read_pixel.py screenshot.png --find-text-region

Screen: 1280x960, (0,0) = top-left, (1279,959) = bottom-right
"""

import sys
from PIL import Image


def get_pixel(img, x, y):
    """Get RGB color at exact pixel coordinate."""
    if 0 <= x < img.width and 0 <= y < img.height:
        r, g, b = img.getpixel((x, y))[:3]
        hex_color = f"{r:02X}{g:02X}{b:02X}"
        return (r, g, b), hex_color
    return None, None


def scan_region(img, x1, y1, x2, y2):
    """Scan a region and report unique colors and their positions."""
    colors = {}
    for y in range(y1, min(y2 + 1, img.height)):
        for x in range(x1, min(x2 + 1, img.width)):
            rgb, hex_color = get_pixel(img, x, y)
            if hex_color not in colors:
                colors[hex_color] = {"rgb": rgb, "count": 0, "first": (x, y)}
            colors[hex_color]["count"] += 1

    # Sort by count descending
    sorted_colors = sorted(colors.items(), key=lambda c: c[1]["count"], reverse=True)
    print(f"\nRegion ({x1},{y1}) to ({x2},{y2}):")
    print(f"{'Color':<10} {'RGB':<18} {'Count':<8} {'First at'}")
    print("-" * 55)
    for hex_c, info in sorted_colors[:20]:
        print(f"{hex_c:<10} {str(info['rgb']):<18} {info['count']:<8} ({info['first'][0]},{info['first'][1]})")


def find_map_name_region(img):
    """
    Find the map name text region at the top of the game viewport.
    The map name is rendered in a distinct color on the game background.
    Scans the expected area and finds text-colored pixels.
    """
    # Expected area for map name (based on verified coordinates)
    # Map name is at top of game viewport, roughly x=365-570, y=170-192
    search_x1, search_y1 = 360, 168
    search_x2, search_y2 = 590, 195

    # Background colors to exclude (game viewport background)
    # These are typically dark/grey tones
    text_pixels = []

    for y in range(search_y1, min(search_y2, img.height)):
        for x in range(search_x1, min(search_x2, img.width)):
            r, g, b = img.getpixel((x, y))[:3]
            # Map name text is typically bright/colored against darker background
            # Filter for non-background pixels (brightness > threshold)
            brightness = (r + g + b) / 3
            if brightness > 100:  # text is brighter than background
                text_pixels.append((x, y, f"{r:02X}{g:02X}{b:02X}"))

    if not text_pixels:
        print("No text pixels found in expected map name area.")
        return

    xs = [p[0] for p in text_pixels]
    ys = [p[1] for p in text_pixels]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    print(f"\nMap name text region detected:")
    print(f"  Top-left:     ({min_x}, {min_y})")
    print(f"  Bottom-right: ({max_x}, {max_y})")
    print(f"  Size:         {max_x - min_x + 1} x {max_y - min_y + 1}")
    print(f"  Text pixels:  {len(text_pixels)}")
    print(f"\n  Suggested FindPic box (with 3px padding):")
    print(f"  FindPic {min_x - 3}, {min_y - 3}, {max_x + 3}, {max_y + 3}")

    # Also show unique colors in the text
    color_counts = {}
    for _, _, c in text_pixels:
        color_counts[c] = color_counts.get(c, 0) + 1
    sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
    print(f"\n  Top text colors:")
    for c, count in sorted_colors[:10]:
        print(f"    {c}: {count} pixels")


def find_color_at_known_points(img):
    """Check colors at all known UI coordinate points for verification."""
    points = {
        "Map name area (457,176)": (457, 176),
        "Map name bottom (389,187)": (389, 187),
        "NPC blue check (510,508)": (510, 508),
        "NPC blue check (482,507)": (482, 507),
        "HP first digit (274,298)": (274, 298),
        "9click chat box (930,638)": (930, 638),
        "Dead body cyan (762,312)": (762, 312),
        "Game close btn (1028,153)": (1028, 153),
        "Error dialog (476,266)": (476, 266),
        "Login screen area (586,205)": (586, 205),
        "WGS logo area (293,211)": (293, 211),
        "Game loaded (263,189)": (263, 189),
    }

    print(f"\nColor check at known UI points:")
    print(f"{'Point':<35} {'Coord':<12} {'Color':<10} {'RGB'}")
    print("-" * 70)
    for name, (x, y) in points.items():
        rgb, hex_c = get_pixel(img, x, y)
        if rgb:
            print(f"{name:<35} ({x},{y}){'':<4} {hex_c:<10} {rgb}")
        else:
            print(f"{name:<35} ({x},{y}){'':<4} OUT OF BOUNDS")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    img_path = sys.argv[1]
    try:
        img = Image.open(img_path)
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    print(f"Image: {img_path}")
    print(f"Size: {img.width} x {img.height}")

    if len(sys.argv) == 4:
        # Single pixel mode
        x, y = int(sys.argv[2]), int(sys.argv[3])
        rgb, hex_c = get_pixel(img, x, y)
        if rgb:
            print(f"Pixel ({x},{y}): color={hex_c} RGB={rgb}")
        else:
            print(f"Pixel ({x},{y}): out of bounds")

    elif len(sys.argv) >= 3 and sys.argv[2] == "--region":
        x1, y1, x2, y2 = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])
        scan_region(img, x1, y1, x2, y2)

    elif len(sys.argv) >= 3 and sys.argv[2] == "--find-text-region":
        find_map_name_region(img)

    elif len(sys.argv) >= 3 and sys.argv[2] == "--check-all":
        find_color_at_known_points(img)

    else:
        # Default: show all info
        find_map_name_region(img)
        find_color_at_known_points(img)


if __name__ == "__main__":
    main()
