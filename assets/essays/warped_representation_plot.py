# - Left: Faithful map with direct agent path
# - Right: Warped map with displaced landmarks, ghost true positions, arrows, and a meandering agent path + warning marker
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch, RegularPolygon
import numpy as np

# Canvas
fig, ax = plt.subplots(figsize=(11, 5.5))
ax.set_axis_off()

# Panels
left_x0, left_y0, panel_w, panel_h = 0.05, 0.1, 0.4, 0.8
right_x0, right_y0 = 0.55, 0.1

ax.add_patch(Rectangle((left_x0, left_y0), panel_w, panel_h, fill=False, linewidth=1.5))
ax.add_patch(Rectangle((right_x0, right_y0), panel_w, panel_h, fill=False, linewidth=1.5))

# Titles
ax.text(left_x0 + panel_w/2, 0.93, "Faithful representation\n", ha="center", va="center", fontsize=12)
ax.text(right_x0 + panel_w/2, 0.93, "Warped representation\n", ha="center", va="center", fontsize=12)

# Helpers
def draw_straight_grid(x0, y0, w, h, nx=6, ny=4):
    for i in range(nx+1):
        x = x0 + w * (i / nx)
        ax.plot([x, x], [y0, y0 + h], linewidth=0.7)
    for j in range(ny+1):
        y = y0 + h * (j / ny)
        ax.plot([x0, x0 + w], [y, y], linewidth=0.7)

def draw_warped_grid(x0, y0, w, h, nx=6, ny=4):
    xs = np.linspace(0, 1, nx+1)
    ys = np.linspace(0, 1, ny+1)
    def warp(u, v):
        return (
            u + 0.08*np.sin(3*np.pi*v) + 0.05*np.sin(2*np.pi*u),
            v + 0.08*np.sin(3*np.pi*u) - 0.04*np.sin(2*np.pi*v)
        )
    for u in xs:
        pts = np.array([warp(u, v) for v in ys])
        X = x0 + w * pts[:,0]
        Y = y0 + h * pts[:,1]
        ax.plot(X, Y, linewidth=0.7)
    for v in ys:
        pts = np.array([warp(u, v) for u in xs])
        X = x0 + w * pts[:,0]
        Y = y0 + h * pts[:,1]
        ax.plot(X, Y, linewidth=0.7)

def warp_uv(u, v):
    return (
        u + 0.08*np.sin(3*np.pi*v) + 0.05*np.sin(2*np.pi*u),
        v + 0.08*np.sin(3*np.pi*u) - 0.04*np.sin(2*np.pi*v)
    )

# Draw grids
draw_straight_grid(left_x0, left_y0, panel_w, panel_h)
draw_warped_grid(right_x0, right_y0, panel_w, panel_h)

# Landmarks (normalized panel coords)
landmarks = {
    "House": (0.2, 0.25),
    "Tree": (0.72, 0.3),
    "Fountain": (0.5, 0.62),
    "Car": (0.32, 0.78),
    "Dog": (0.82, 0.78),
}
markers = {"House":"s", "Tree":"^", "Fountain":"o", "Car":"D", "Dog":"*"}

# Place on left (faithful)
for name, (u, v) in landmarks.items():
    x = left_x0 + panel_w*u
    y = left_y0 + panel_h*v
    ax.scatter([x], [y], marker=markers[name], s=80, zorder=3)
    ax.text(x, y+0.03, name, ha="center", va="bottom", fontsize=9)

# Agent path on left: House -> Fountain (direct)
start = "House"
goal = "Fountain"
x_s = left_x0 + panel_w*landmarks[start][0]
y_s = left_y0 + panel_h*landmarks[start][1]
x_g = left_x0 + panel_w*landmarks[goal][0]
y_g = left_y0 + panel_h*landmarks[goal][1]
ax.plot([x_s, x_g], [y_s, y_g], linestyle="-", linewidth=2, alpha=0.9, zorder=2)
ax.text((x_s+x_g)/2, (y_s+y_g)/2+0.03, "Direct path", ha="center", va="bottom", fontsize=9)

# Place on right (warped) with displacement
displacements = {
    "House": (0.03, -0.02),
    "Tree": (-0.04, 0.03),
    "Fountain": (0.02, 0.04),
    "Car": (-0.03, -0.03),
    "Dog": (0.05, -0.02),
}

# Draw ghost true positions on right (faint)
for name, (u, v) in landmarks.items():
    x_true = right_x0 + panel_w*u
    y_true = right_y0 + panel_h*v
    ax.scatter([x_true], [y_true], marker=markers[name], s=80, alpha=0.25, zorder=1)
    ax.text(x_true, y_true-0.035, "true", ha="center", va="top", fontsize=8, alpha=0.6)

# Warped + displaced positions and arrows to true
warped_positions = {}
for name, (u, v) in landmarks.items():
    uw, vw = warp_uv(u, v)
    du, dv = displacements[name]
    x_w = right_x0 + panel_w*(uw + du)
    y_w = right_y0 + panel_h*(vw + dv)
    warped_positions[name] = (x_w, y_w)
    ax.scatter([x_w], [y_w], marker=markers[name], s=80, zorder=3)
    ax.text(x_w, y_w+0.03, name, ha="center", va="bottom", fontsize=9)
    # Arrow from warped to true
    x_true = right_x0 + panel_w*u
    y_true = right_y0 + panel_h*v
    ax.add_patch(FancyArrowPatch((x_w, y_w), (x_true, y_true),
                                 arrowstyle="->", mutation_scale=8, lw=1.2, alpha=0.8, zorder=2))

# Agent path on right: House -> Fountain (meandering due to warp)
x_s_w, y_s_w = warped_positions[start]
x_g_w, y_g_w = warped_positions[goal]

# Create a curved path using a few control points to suggest confusion
ctrl1 = (x_s_w + 0.12, y_s_w + 0.07)
ctrl2 = (x_g_w - 0.10, y_g_w - 0.12)
t = np.linspace(0, 1, 100)
# Quadratic-like piecewise curve
curve_x = (1-t)**2 * x_s_w + 2*(1-t)*t * ctrl1[0] + t**2 * ((x_s_w + x_g_w)/2)
curve_y = (1-t)**2 * y_s_w + 2*(1-t)*t * ctrl1[1] + t**2 * ((y_s_w + y_g_w)/2)
curve2_x = (1-t)**2 * ((x_s_w + x_g_w)/2) + 2*(1-t)*t * ctrl2[0] + t**2 * x_g_w
curve2_y = (1-t)**2 * ((y_s_w + y_g_w)/2) + 2*(1-t)*t * ctrl2[1] + t**2 * y_g_w

ax.plot(curve_x, curve_y, linestyle="--", linewidth=2, alpha=0.9, zorder=2)
ax.plot(curve2_x, curve2_y, linestyle="--", linewidth=2, alpha=0.9, zorder=2)
ax.text((x_s_w+x_g_w)/2, (y_s_w+y_g_w)/2+0.04, "Confused path", ha="center", va="bottom", fontsize=9)

# Warning marker near the curved path
warn_x = curve2_x[len(curve2_x)//3]
warn_y = curve2_y[len(curve2_y)//3]
triangle = RegularPolygon((warn_x, warn_y), numVertices=3, radius=0.015, orientation=np.pi, zorder=4)
ax.add_patch(triangle)
ax.text(warn_x, warn_y-0.03, "risk", ha="center", va="top", fontsize=8)

# Panel captions
ax.text(left_x0 + panel_w/2, 0.06, "\nAligned grid & landmarks\n → distances/relations preserved", ha="center", va="center", fontsize=12)
ax.text(right_x0 + panel_w/2, 0.06, "\nWarped grid & displaced landmarks\n → misread distances/relations, longer/erratic path", ha="center", va="center", fontsize=12)

outpath = "internal_map.svg"
plt.savefig(outpath, bbox_inches="tight", dpi=300)
