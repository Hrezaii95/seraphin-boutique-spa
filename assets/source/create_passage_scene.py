"""Create the original Seraphin Passage scene and export an optimized-ready GLB.

Run with:
  blender --background --python assets/source/create_passage_scene.py

The scene uses only original procedural geometry and Blender-native materials.
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
BLEND_PATH = Path(__file__).resolve().parent / "seraphin-passage.blend"
GLB_PATH = Path(__file__).resolve().parent / "seraphin-passage-source.glb"


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def material(name: str, color: tuple[float, float, float, float], metallic: float, roughness: float, emission: tuple[float, float, float] | None = None) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    principled = mat.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = color
        principled.inputs["Metallic"].default_value = metallic
        principled.inputs["Roughness"].default_value = roughness
        principled.inputs["Alpha"].default_value = color[3]
        if emission:
            emission_input = principled.inputs.get("Emission Color") or principled.inputs.get("Emission")
            strength_input = principled.inputs.get("Emission Strength")
            if emission_input:
                emission_input.default_value = (*emission, 1.0)
            if strength_input:
                strength_input.default_value = 0.8
    if color[3] < 1:
        mat.surface_render_method = "DITHERED"
    return mat


def apply_modifiers(obj: bpy.types.Object) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for modifier in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(False)


def create_leaf(name: str, length: float, width: float, depth: float, mat: bpy.types.Material) -> bpy.types.Object:
    rings = 14
    verts: list[tuple[float, float, float]] = []
    faces: list[tuple[int, int, int, int]] = []
    for index in range(rings):
        t = index / (rings - 1)
        envelope = math.sin(math.pi * t) ** 0.72
        half_width = max(0.018, width * envelope)
        vertical = 0.28 + t * length
        curl = math.sin(t * math.pi) * depth + (t ** 2) * depth * 0.42
        verts.extend([(-half_width, curl, vertical), (half_width, curl, vertical)])
        if index:
            current = index * 2
            faces.append((current - 2, current - 1, current + 1, current))
    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    solidify = obj.modifiers.new("PetalThickness", "SOLIDIFY")
    solidify.thickness = 0.055
    bevel = obj.modifiers.new("SoftPetalEdge", "BEVEL")
    bevel.width = 0.045
    bevel.segments = 3
    apply_modifiers(obj)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def create_curve(name: str, points: list[tuple[float, float, float]], bevel: float, mat: bpy.types.Material, cyclic: bool = False) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 8
    curve.bevel_depth = bevel
    curve.bevel_resolution = 3
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def create_linen(mat: bpy.types.Material) -> bpy.types.Object:
    columns, rows = 18, 26
    width, height = 2.15, 5.2
    verts: list[tuple[float, float, float]] = []
    faces: list[tuple[int, int, int, int]] = []
    for row in range(rows):
        v = row / (rows - 1)
        for column in range(columns):
            u = column / (columns - 1)
            x = (u - 0.5) * width
            z = v * height - 1.4
            y = 13.4 + math.sin(u * math.pi * 2 + v * 2.1) * 0.19 + math.sin(v * math.pi * 3) * 0.08
            verts.append((x, y, z))
            if row and column:
                a = row * columns + column
                faces.append((a - columns - 1, a - columns, a, a - 1))
    mesh = bpy.data.meshes.new("LinenPassageMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("LinenPassage", mesh)
    bpy.context.collection.objects.link(obj)
    obj.location.x = 2.1
    obj.data.materials.append(mat)
    solidify = obj.modifiers.new("LinenThickness", "SOLIDIFY")
    solidify.thickness = 0.025
    bevel = obj.modifiers.new("LinenEdge", "BEVEL")
    bevel.width = 0.02
    bevel.segments = 2
    apply_modifiers(obj)
    left = obj.copy()
    left.data = obj.data.copy()
    left.name = "LinenPassageLeft"
    left.location.x = -2.1
    left.rotation_euler.z = math.radians(4)
    bpy.context.collection.objects.link(left)
    return obj


def add_ico(name: str, location: tuple[float, float, float], scale: tuple[float, float, float], mat: bpy.types.Material, subdivisions: int = 3) -> bpy.types.Object:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = obj.modifiers.new("HonedEdge", "BEVEL")
    bevel.width = 0.06
    bevel.segments = 2
    apply_modifiers(obj)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def add_arch(index: int, y: float, brass: bpy.types.Material) -> None:
    width = 6.6 - index * 0.18
    points = [
        (-width / 2, y, -1.15),
        (-width / 2, y, 2.15),
        (-width * 0.36, y, 3.62),
        (0, y, 4.18),
        (width * 0.36, y, 3.62),
        (width / 2, y, 2.15),
        (width / 2, y, -1.15),
    ]
    create_curve(f"SanctuaryArch_{index:02d}", points, 0.055 if index else 0.075, brass)


def build_scene() -> None:
    reset_scene()

    forest = material("ForestLinen", (0.055, 0.13, 0.09, 1), 0.05, 0.63)
    forest_soft = material("ForestSoft", (0.12, 0.25, 0.17, 1), 0.12, 0.48)
    brass = material("RitualBrass", (0.56, 0.38, 0.12, 1), 0.72, 0.22)
    brass_glow = material("BrassGlow", (0.78, 0.55, 0.2, 1), 0.45, 0.2, (0.45, 0.22, 0.04))
    stone = material("WarmStone", (0.25, 0.28, 0.22, 1), 0.04, 0.78)
    stone_light = material("WarmStoneLight", (0.46, 0.43, 0.34, 1), 0.02, 0.7)
    linen = material("WarmLinen", (0.58, 0.54, 0.4, 0.68), 0.0, 0.86)
    herb = material("HerbalGreen", (0.24, 0.38, 0.19, 1), 0.02, 0.72)
    oil = material("BotanicalOil_Glow", (0.64, 0.42, 0.1, 0.72), 0.38, 0.16, (0.32, 0.13, 0.02))

    bloom = bpy.data.objects.new("QuietBloom", None)
    bpy.context.collection.objects.link(bloom)
    for index in range(14):
        outer = index % 2 == 0
        petal = create_leaf(
            f"BloomPetal_{index:02d}",
            2.35 if outer else 1.82,
            0.66 if outer else 0.55,
            0.3 if outer else 0.22,
            brass if index % 4 == 0 else forest_soft,
        )
        petal.parent = bloom
        petal.rotation_euler[1] = (index / 14) * math.tau
        petal.rotation_euler[0] = -0.16 if outer else 0.04

    core = add_ico("BloomCore", (0, -0.06, 0.26), (0.27, 0.16, 0.27), brass_glow, 3)
    core.parent = bloom
    create_curve("BloomOrbit", [(math.cos(a) * 2.55, 0.12, math.sin(a) * 2.55) for a in [i * math.tau / 18 for i in range(18)]], 0.018, brass, True)

    stone_group = bpy.data.objects.new("StoneRitual", None)
    bpy.context.collection.objects.link(stone_group)
    stone_specs = [
        ((-1.6, 5.4, -0.7), (1.35, 0.7, 0.48), stone),
        ((-0.45, 5.7, -0.92), (1.1, 0.6, 0.38), stone_light),
        ((-2.45, 5.9, -0.93), (0.72, 0.46, 0.3), stone),
    ]
    for index, (location, scale, mat) in enumerate(stone_specs):
        obj = add_ico(f"WarmStone_{index:02d}", location, scale, mat, 3)
        obj.parent = stone_group
        obj.rotation_euler = (0.1 * index, 0.18 * index, -0.08 * index)
    for radius in (1.25, 1.75, 2.25):
        create_curve(f"HeatRing_{radius}", [(math.cos(a) * radius - 1.35, 5.86, math.sin(a) * radius - 0.8) for a in [i * math.tau / 28 for i in range(28)]], 0.016, brass, True)

    create_curve("OilRibbon", [
        (-2.5, 8.5, 0.0), (-1.3, 9.0, 1.55), (0.4, 9.9, 0.1),
        (2.0, 10.6, 1.8), (1.05, 11.5, 3.15), (-0.7, 12.0, 1.5),
    ], 0.09, oil)
    oil_orb = add_ico("OilOrb", (1.4, 10.45, 0.35), (0.4, 0.4, 0.4), oil, 4)
    oil_orb.rotation_euler = (0.2, 0.1, 0)

    create_linen(linen)

    compress = add_ico("HerbalCompress", (-1.55, 15.5, 0.2), (0.74, 0.66, 0.78), herb, 3)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.35, minor_radius=0.055, major_segments=24, minor_segments=8, location=(-1.55, 15.48, 0.92), rotation=(math.pi / 2, 0, 0))
    tie = bpy.context.object
    tie.name = "HerbalTie"
    tie.data.materials.append(brass)
    create_curve("HerbalStem", [(-1.55, 15.48, 0.95), (-1.4, 15.52, 1.35), (-1.72, 15.58, 1.72)], 0.08, linen)

    sanctuary = bpy.data.objects.new("Sanctuary", None)
    bpy.context.collection.objects.link(sanctuary)
    for index, y in enumerate((18.2, 19.7, 21.3, 23.0, 24.8, 26.7)):
        add_arch(index, y, brass if index < 4 else brass_glow)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=4.25, depth=0.18, location=(0, 23.5, -1.28))
    floor = bpy.context.object
    floor.name = "SanctuaryFloor"
    floor.data.materials.append(stone)

    mark = bpy.data.objects.new("SanctuaryMark", None)
    bpy.context.collection.objects.link(mark)
    mark.location = (0, 26.3, 1.25)
    for index in range(6):
        petal = create_leaf(f"SanctuaryPetal_{index:02d}", 0.92, 0.28, 0.12, brass_glow)
        petal.parent = mark
        petal.rotation_euler[1] = index * math.tau / 6
    mark_core = add_ico("SanctuaryCore_Glow", (0, 26.25, 1.48), (0.26, 0.16, 0.26), brass_glow, 2)
    mark_core.parent = mark

    for x in (-3.4, 3.4):
        create_curve(f"LinenRail_{x}", [(x, 18.0, -1.0), (x, 22.5, 1.6), (x, 27.0, 3.7)], 0.035, linen)

    bpy.context.scene.world.color = (0.004, 0.012, 0.008)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 50
    scene.render.image_settings.file_format = "PNG"

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    GLB_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_animations=False,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"Saved {BLEND_PATH}")
    print(f"Exported {GLB_PATH}")


if __name__ == "__main__":
    build_scene()
