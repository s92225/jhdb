"""
打坐時間 Analysis — identify what affects meditation time across characters.

Usage:
  python dazuo_analysis.py            # run analysis + show chart
  python dazuo_analysis.py --estimate # interactive estimator mode
"""

import sys
import numpy as np
from scipy import stats
import matplotlib
matplotlib.use('Agg')  # non-interactive backend — saves to file only
import matplotlib.pyplot as plt
from matplotlib import rcParams

# ---------------------------------------------------------------------------
# DATA — add new characters here
# ---------------------------------------------------------------------------
CHARACTERS = {
    "凍檸茶少甜": {
        "門派": "鎮遠武館",
        "基本內功": 459,
        "轉生": True,
        "data": [  # (內力, 費時s)
            (20, 3.96),
            (30, 4.26),
            (40, 5.90),
            (50, 6.29),
            (60, 7.34),
            (70, 7.08),
            (110, 10.33),
            (200, 18.33),
            (300, 25.34),
        ],
    },
    "少林": {
        "門派": "少林",
        "基本內功": 500,
        "轉生": True,
        "data": [  # (內力, 費時s)
            (20, 3.74),
            (30, 3.82),
            (40, 5.69),
            (50, 5.91),
            (60, 7.01),
            (70, 7.01),
            (80, 9.31),
            (90, 9.50),
            (100, 10.19),
            (110, 10.05),
            (200, 18.35),
            (300, 25.32),
        ],
    },
    "Pain (未轉生)": {
        "門派": "少林",
        "基本內功": 474,
        "轉生": False,
        "data": [  # (內力, 費時s)
            (20, 10.42),
            (50, 13.61),
            (70, 14.96),
            (100, 19.61),
            (200, 32.54),
            (300, 45.55),
        ],
    },
}

# ---------------------------------------------------------------------------
# ANALYSIS HELPERS
# ---------------------------------------------------------------------------

def linear_fit(x, y):
    """Return (slope, intercept, r_squared, std_err)."""
    slope, intercept, r, p, se = stats.linregress(x, y)
    return slope, intercept, r ** 2, se


def print_separator(title):
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}")


# ---------------------------------------------------------------------------
# PER-CHARACTER ANALYSIS
# ---------------------------------------------------------------------------

def analyze_characters():
    results = {}

    print_separator("Per-Character Linear Regression: time = a + b × 內力")

    for name, info in CHARACTERS.items():
        data = np.array(info["data"])
        x, y = data[:, 0], data[:, 1]
        slope, intercept, r2, se = linear_fit(x, y)
        results[name] = {
            "slope": slope,
            "intercept": intercept,
            "r2": r2,
            "se": se,
            "x": x,
            "y": y,
            "基本內功": info["基本內功"],
            "門派": info["門派"],
        }

        print(f"\n  [{name}]  門派={info['門派']}  基本內功={info['基本內功']}")
        print(f"    time = {intercept:.4f} + {slope:.6f} × 內力")
        print(f"    R² = {r2:.6f}   slope_se = {se:.6f}")
        print(f"    → per 10 內力: +{slope * 10:.3f}s")

        # residuals
        predicted = intercept + slope * x
        residuals = y - predicted
        print(f"    max |residual| = {np.max(np.abs(residuals)):.3f}s")

    return results


# ---------------------------------------------------------------------------
# COMBINED ANALYSIS — pool all data
# ---------------------------------------------------------------------------

def analyze_combined():
    print_separator("Combined (All Characters Pooled)")

    all_x, all_y = [], []
    for info in CHARACTERS.values():
        data = np.array(info["data"])
        all_x.extend(data[:, 0])
        all_y.extend(data[:, 1])

    all_x, all_y = np.array(all_x), np.array(all_y)
    slope, intercept, r2, se = linear_fit(all_x, all_y)

    print(f"  time = {intercept:.4f} + {slope:.6f} × 內力")
    print(f"  R² = {r2:.6f}")
    print(f"  → per 10 內力: +{slope * 10:.3f}s")

    return slope, intercept, r2


# ---------------------------------------------------------------------------
# MULTI-VARIABLE ANALYSIS — does 基本內功 matter?
# ---------------------------------------------------------------------------

def analyze_multivariable():
    print_separator("Multi-Variable: time = a + b1×內力 + b2×基本內功")

    rows = []
    for info in CHARACTERS.values():
        neigong = info["基本內功"]
        for nl, t in info["data"]:
            rows.append([nl, neigong, t])

    arr = np.array(rows)
    X = arr[:, :2]  # 內力, 基本內功
    y = arr[:, 2]   # time

    # Add intercept column
    X_aug = np.column_stack([np.ones(len(X)), X])
    # OLS: beta = (X'X)^-1 X'y
    beta, residuals, rank, sv = np.linalg.lstsq(X_aug, y, rcond=None)

    y_pred = X_aug @ beta
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r2 = 1 - ss_res / ss_tot

    print(f"  intercept   = {beta[0]:.4f}")
    print(f"  b(內力)     = {beta[1]:.6f}")
    print(f"  b(基本內功) = {beta[2]:.6f}")
    print(f"  R² = {r2:.6f}")
    print()

    if abs(beta[2]) < 0.001:
        print("  → 基本內功 coefficient is near zero — likely NOT a significant factor")
    else:
        print(f"  → 基本內功 contributes {beta[2]:.6f}s per unit")
        print(f"     e.g. 基本內功 459 vs 500: diff = {beta[2] * (500 - 459):.3f}s")

    return beta, r2


# ---------------------------------------------------------------------------
# CHARACTER COMPARISON
# ---------------------------------------------------------------------------

def compare_characters(results):
    names = list(results.keys())
    if len(names) < 2:
        return

    print_separator("Character Comparison")

    print(f"\n  {'Character':<16} {'門派':<10} {'基本內功':>8} {'slope':>10} {'intercept':>10} {'R²':>8}")
    print(f"  {'-'*16} {'-'*10} {'-'*8} {'-'*10} {'-'*10} {'-'*8}")
    for name, r in results.items():
        print(f"  {name:<16} {r['門派']:<10} {r['基本內功']:>8} {r['slope']:>10.6f} {r['intercept']:>10.4f} {r['r2']:>8.6f}")

    # Pairwise slope comparison
    print()
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            a, b = names[i], names[j]
            slope_diff = results[a]["slope"] - results[b]["slope"]
            int_diff = results[a]["intercept"] - results[b]["intercept"]
            print(f"  {a} vs {b}:")
            print(f"    slope diff  = {slope_diff:+.6f} (per 內力)")
            print(f"    intercept diff = {int_diff:+.4f}s")
            print(f"    → At 內力=100: time diff ≈ {int_diff + slope_diff * 100:+.3f}s")
            print(f"    → At 內力=300: time diff ≈ {int_diff + slope_diff * 300:+.3f}s")


# ---------------------------------------------------------------------------
# POLYNOMIAL FIT CHECK
# ---------------------------------------------------------------------------

def check_polynomial():
    print_separator("Model Comparison: Linear vs Quadratic")

    all_x, all_y = [], []
    for info in CHARACTERS.values():
        data = np.array(info["data"])
        all_x.extend(data[:, 0])
        all_y.extend(data[:, 1])
    all_x, all_y = np.array(all_x), np.array(all_y)

    for degree, label in [(1, "Linear"), (2, "Quadratic")]:
        coeffs = np.polyfit(all_x, all_y, degree)
        poly = np.poly1d(coeffs)
        y_pred = poly(all_x)
        ss_res = np.sum((all_y - y_pred) ** 2)
        ss_tot = np.sum((all_y - np.mean(all_y)) ** 2)
        r2 = 1 - ss_res / ss_tot
        print(f"\n  {label} (degree {degree}):")
        print(f"    coefficients = {coeffs}")
        print(f"    R² = {r2:.6f}")


# ---------------------------------------------------------------------------
# CHART
# ---------------------------------------------------------------------------

def plot_chart(results, combined_slope, combined_intercept):
    rcParams['font.sans-serif'] = ['Microsoft JhengHei', 'SimHei', 'Arial']
    rcParams['axes.unicode_minus'] = False

    fig, ax = plt.subplots(figsize=(10, 6))

    colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6']
    markers = ['o', 's', '^', 'D', 'v']

    x_line = np.linspace(0, 350, 100)

    for i, (name, r) in enumerate(results.items()):
        c = colors[i % len(colors)]
        m = markers[i % len(markers)]
        ax.scatter(r["x"], r["y"], color=c, marker=m, s=60, zorder=3,
                   label=f'{name} (基本內功={r["基本內功"]})')
        y_fit = r["intercept"] + r["slope"] * x_line
        ax.plot(x_line, y_fit, color=c, linewidth=1, alpha=0.7, linestyle='--')

    # Combined fit
    y_combined = combined_intercept + combined_slope * x_line
    ax.plot(x_line, y_combined, color='black', linewidth=2, alpha=0.8,
            label=f'Combined: {combined_intercept:.2f} + {combined_slope:.4f}×內力')

    ax.set_xlabel('打坐 內力', fontsize=12)
    ax.set_ylabel('費時 (s)', fontsize=12)
    ax.set_title('打坐時間 vs 內力 — Character Comparison', fontsize=14)
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_xlim(0, 320)
    ax.set_ylim(0, 30)

    plt.tight_layout()
    import os
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dazuo_analysis.png")
    plt.savefig(out_path, dpi=150)
    print(f"\n  Chart saved to {out_path}")


# ---------------------------------------------------------------------------
# INTERACTIVE ESTIMATOR
# ---------------------------------------------------------------------------

def estimate_mode(combined_slope, combined_intercept):
    print_separator("打坐時間 Estimator")
    print(f"  Formula: time = {combined_intercept:.4f} + {combined_slope:.6f} × 內力")
    print(f"  (Based on pooled data from {len(CHARACTERS)} characters)")
    print()

    while True:
        try:
            raw = input("  Enter 內力 amount (or 'q' to quit): ").strip()
            if raw.lower() == 'q':
                break
            neili = float(raw)
            est_time = combined_intercept + combined_slope * neili
            print(f"  → Estimated time: {est_time:.2f}s ({est_time/60:.1f} min)")

            # Reverse: how much 內力 for a given time?
            raw2 = input("  Enter target time in seconds (or Enter to skip): ").strip()
            if raw2:
                target = float(raw2)
                needed = (target - combined_intercept) / combined_slope
                print(f"  → Need {needed:.0f} 內力 for {target}s")
            print()
        except ValueError:
            print("  Invalid input, try again.")
        except KeyboardInterrupt:
            break


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    print("\n" + "=" * 60)
    print("  打坐時間 Analysis")
    print("=" * 60)

    # Per-character
    results = analyze_characters()

    # Combined
    c_slope, c_intercept, c_r2 = analyze_combined()

    # Multi-variable (does 基本內功 matter?)
    analyze_multivariable()

    # Compare characters
    compare_characters(results)

    # Polynomial check
    check_polynomial()

    # Summary
    print_separator("SUMMARY")
    print(f"  Best simple formula (all characters):")
    print(f"    time ≈ {c_intercept:.2f} + {c_slope:.4f} × 內力")
    print(f"    R² = {c_r2:.4f}")
    print(f"\n  Quick reference:")
    for nl in [20, 50, 100, 200, 300, 500, 1000, 3900]:
        t = c_intercept + c_slope * nl
        print(f"    內力 {nl:>5}: ~{t:>7.1f}s  ({t/60:>5.1f} min)")

    # Chart or estimate mode
    if "--estimate" in sys.argv:
        estimate_mode(c_slope, c_intercept)
    else:
        try:
            plot_chart(results, c_slope, c_intercept)
        except Exception as e:
            print(f"\n  Could not show chart: {e}")
            print("  (Run in a GUI environment to see the chart)")


if __name__ == "__main__":
    main()
