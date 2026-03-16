# Regenerate Figure 3 with two "maps" inside a single representation space:
# - Representation space now orange-themed (per user request for orange hex)
# - Two mini-maps inside: left = Faithful map (straight grid), right = Warped map (warped grid)
# - Keep earlier layout improvements (bold container text, arrow colors, spacing)

import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, PathPatch, Rectangle
from matplotlib.path import Path
import matplotlib as mpl
import numpy as np

# Typography & sizing
mpl.rcParams.update({
    "figure.dpi": 200,
    "font.size": 11,
    "axes.titlesize": 14,
    "axes.labelsize": 12,
})

fig_w, fig_h = 13.5, 7.6
fig, ax = plt.subplots(figsize=(fig_w, fig_h))
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.set_axis_off()

# Column anchors with generous gaps
x_left, x_mid, x_right = 0.16, 0.52, 0.84
y_top, y_mid, y_bot = 0.72, 0.45, 0.18
bw, bh = 0.22, 0.14

def box(cx, cy, text, w=bw, h=bh, fontsize=12, pad=0.012, color="black"):
    x = cx - w/2; y = cy - h/2
    rect = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad={pad}", fill=False, linewidth=1.8, color=color)
    ax.add_patch(rect)
    ax.text(cx, cy, text, ha="center", va="center", fontsize=fontsize, fontweight="bold", wrap=True)
    return rect

def arrow(p1, p2, ls="-", label=None, label_offset=(0,0), rad=0.0, lw=1, color="black"):
    ar = FancyArrowPatch(p1, p2, arrowstyle="->", mutation_scale=16, lw=lw,
                         linestyle=ls, connectionstyle=f"arc3,rad={rad}", color=color)
    ax.add_patch(ar)
    if label:
        ax.text((p1[0]+p2[0])/2 + label_offset[0], (p1[1]+p2[1])/2 + label_offset[1],
                label, ha="center", va="center", fontsize=11, fontweight="bold", color=color)
    return ar

# Arrows and labels
blue = "#145DA0"
red = "#B00020"

# Titles
ax.text(0.5, 0.975, "How caption policy shapes learned features and outcomes\n", ha="center", va="center", fontsize=16, fontweight="bold")
ax.text(x_left, 0.905, "Caption policy", ha="center", va="center", fontsize=15)
ax.text(x_mid,  0.905, "Learned features", ha="center", va="center", fontsize=15)
ax.text(x_right,0.905, "Outcomes", ha="center", va="center", fontsize=15)

# Left column
b_faithful = box(x_left, y_top, "Faithful captions\n(complete & factual)", color=blue)
b_noisy    = box(x_left, y_mid, "Noisy / biased captions\n(omitted or incorrect)", color=red)
b_ctrl     = box(x_left, y_bot, "Controlled perturbation\n(with proper rep capacity)", color=red)

# Representation space (orange)
orange_edge = "#FF8C00"  # DarkOrange
orange_fill = (1.0, 0.55, 0.0, 0.10)  # translucent fill

# Representation space (orange hourglass)
orange_edge = "#FF8C00"                       # DarkOrange
orange_fill = (1.0, 0.55, 0.0, 0.10)          # translucent fill

# Hourglass generator around center with similar area/placement
cx, top, bot = 0.545, 0.85, 0.24
ys = np.linspace(top, bot, 160)               # top -> bottom
# base width controls overall size; k controls waist narrowness
base = 0.18
k = 0.3
# normalize y to [0,1] between top and bottom
yn = (ys - bot) / (top - bot)
# hourglass width: widest at ends, narrowest at middle
width = base * (0.65 + k * (2*yn - 1)**2)
right_x = cx + width
left_x  = cx - 1.2*width

# Build closed path (top->bottom on right side, bottom->top on left side)
verts = np.concatenate([np.c_[right_x, ys], np.c_[left_x[::-1], ys[::-1]]])
codes = [Path.MOVETO] + [Path.LINETO]*(len(verts)-1)
# Create a PathPatch without closing the polygon
rep_space = PathPatch(
    Path(verts, codes, closed=False),  # closed=False prevents automatic bottom closure
    facecolor=orange_fill,
    edgecolor=orange_edge,
    lw=0,
    joinstyle="round"
)
ax.add_patch(rep_space)
right_side = np.c_[right_x, ys]          # right boundary: top → bottom
left_side  = np.c_[left_x, ys]           # left boundary: top → bottom
# Draw right boundary
ax.plot(right_side[:, 0], right_side[:, 1],
        color=orange_edge, lw=2.6)
# Draw left boundary
ax.plot(left_side[:, 0], left_side[:, 1],
        color=orange_edge, lw=2.6)

# Two mini-maps inside representation space
# Define panels (rounded rectangles) positioned within the blob
mini_w, mini_h = 0.18, 0.17
# mini1 = Rectangle((0.43, 0.63), mini_w, mini_h, fill=False, linewidth=1.2)
# mini2 = Rectangle((0.53, 0.35), mini_w, mini_h, fill=False, linewidth=1.2)
# for r in (mini1, mini2):
#     r.set_clip_path(rep_space)
#     ax.add_patch(r)

# Helper: draw straight grid
def draw_straight_grid(x0, y0, w, h, nx=4, ny=3, alpha=0.8):
    for i in range(nx+1):
        x = x0 + w * (i / nx)
        ax.plot([x, x], [y0, y0 + h], linewidth=1.2, alpha=alpha)
    for j in range(ny+1):
        y = y0 + h * (j / ny)
        ax.plot([x0, x0 + w], [y, y], linewidth=1.2, alpha=alpha)

# Helper: draw warped grid
def draw_warped_grid(x0, y0, w, h, nx=4, ny=3, alpha=0.8):
    xs = np.linspace(0, 1, nx+1)
    ys = np.linspace(0, 1, ny+1)
    def warp(u, v):
        return (u + 0.10*np.sin(2.5*np.pi*v) + 0.06*np.sin(2*np.pi*u),
                v + 0.10*np.sin(2.5*np.pi*u) - 0.05*np.sin(2*np.pi*v))
    for u in xs:
        pts = np.array([warp(u, v) for v in ys])
        X = x0 + w * pts[:,0]; Y = y0 + h * pts[:,1]
        ax.plot(X, Y, linewidth=1.2, alpha=alpha)
    for v in ys:
        pts = np.array([warp(u, v) for u in xs])
        X = x0 + w * pts[:,0]; Y = y0 + h * pts[:,1]
        ax.plot(X, Y, linewidth=1.2, alpha=alpha)

# Draw mini-map contents
draw_straight_grid(0.43, 0.63, mini_w, mini_h, nx=4, ny=3, alpha=0.9)
draw_warped_grid(0.46, 0.35, mini_w, mini_h, nx=4, ny=3, alpha=0.9)

# Labels near mini-maps
ax.text(0.52, 0.82, "Identifiable reps.", ha="center", va="center", fontsize=12, fontweight="bold")
ax.text(0.55, 0.55, "Warped reps.", ha="center", va="center", fontsize=12, fontweight="bold")

# Outcomes (right column)
b_robust = box(x_right, y_top, "Robustness\n(OOD / domain shift)", color=blue)
b_interp = box(x_right, y_mid, "Interpretability\n & fairness", color=blue)
b_hallu  = box(x_right, y_bot, "Hallucination /\nfragile performance", color=red)


# Left -> middle
arrow((x_left + bw/2, y_top), (0.45, 0.72), ls="-", label="embed\n true semantics",
      label_offset=(0.02, 0.05), color=blue)
arrow((x_left + bw/2, y_mid), (0.48, 0.40), ls=":", label="omit /\n distort factors",
      label_offset=(0.04, -0.045), color=red)
arrow((x_left + bw/2, y_bot), (0.45, 0.66), ls="--", label="suppress\n nuisance variables",
      label_offset=(0.05, 0.05), color=blue)

# Middle -> right
arrow((0.61, 0.76), (x_right - bw/2, y_top+0.01), ls="-", label="stable\n features",
      label_offset=(0.00, 0.04), color=blue)
arrow((0.60, 0.66), (x_right - bw/2, y_mid), ls="-", label="clean\n semantics",
      label_offset=(0.00, 0.03), color=blue)
arrow((0.60, 0.40), (x_right - bw/2, y_bot-0.01), ls=":", label="spurious\n cues",
      label_offset=(0.00, -0.03), color=red)

# Legend for representation space
legend_handle = FancyBboxPatch((0,0), 0.1, 0.1, boxstyle="round,pad=0.02",
                               edgecolor=orange_edge, facecolor=orange_fill, lw=2.0)
ax.legend([legend_handle], ["\nCapacity of Information Bottleneck"],
          loc="lower center", bbox_to_anchor=(0.5, 0.06), frameon=False, fontsize=11)

svg_path = "flowchart.svg"
plt.savefig(svg_path, bbox_inches="tight")
