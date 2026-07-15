/**
 * ZEHLA — WebGL Bridge 3D Volumetry Engine
 *
 * Bridges BIM Vision extracted data to WebGL 3D rendering pipeline.
 * Generates volumetric mesh data, material definitions, and scene graphs
 * optimized for real-time browser rendering via Three.js / WebGL 2.0.
 *
 * MOCK MODE: High-fidelity simulation of 3D scene generation.
 * Real implementation would use:
 *   - three.js BufferGeometry from BIM vertex data
 *   - InstancedMesh for repetitive elements (walls, columns)
 *   - PBR materials with real IOR and roughness from BIM properties
 *   - LOD (Level of Detail) generation for performance
 *   - Octree spatial indexing for raycasting
 *
 * Confidence Lock: > 0.95 required for any modification.
 */

import type { BIMElement, SpatialZone, BIMExtractionResult } from '@/lib/bim-vision';

// ── Types ──

export interface MeshVertex {
  x: number;
  y: number;
  z: number;
  nx: number; // normal x
  ny: number; // normal y
  nz: number; // normal z
  u: number; // UV x
  v: number; // UV y
}

export interface MeshData {
  meshId: string;
  parentElementId: string;
  ifcType: string;
  name: string;
  vertices: MeshVertex[];
  indices: number[];
  material: PBRMaterial;
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  triangleCount: number;
  vertexCount: number;
  lodLevels: number;
}

export interface PBRMaterial {
  name: string;
  baseColor: [number, number, number]; // RGB 0-1
  roughness: number; // 0 (mirror) to 1 (matte)
  metalness: number; // 0 (dielectric) to 1 (metal)
  opacity: number; // 0 (transparent) to 1 (opaque)
  emissive: [number, number, number]; // RGB 0-1
  emissiveIntensity: number;
  ior: number; // Index of Refraction
  transmission: number; // 0 (opaque) to 1 (glass-like)
}

export interface SceneNode {
  nodeId: string;
  name: string;
  type: 'group' | 'mesh' | 'light' | 'camera' | 'zone';
  children: string[]; // child node IDs
  meshId?: string;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number]; // Euler angles in degrees
    scale: [number, number, number];
  };
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface WebGLScene {
  traceId: string;
  timestamp: string;
  tenantId: string;
  sceneGraph: {
    rootNodeId: string;
    nodes: Record<string, SceneNode>;
  };
  meshes: MeshData[];
  lights: LightDefinition[];
  camera: CameraDefinition;
  statistics: {
    totalMeshes: number;
    totalVertices: number;
    totalTriangles: number;
    totalSceneNodes: number;
    totalMaterials: number;
    estimatedDrawCalls: number;
    estimatedVRAM_mb: number;
    octreeDepth: number;
  };
  renderPipeline: {
    backend: 'WebGL2' | 'WebGPU';
    antialiasing: 'MSAA_4X' | 'MSAA_8X' | 'FXAA' | 'TAA';
    toneMapping: 'ACES_Filmic' | 'Linear' | 'Reinhard' | 'Cineon';
    shadowMap: 'PCF_Soft' | 'VSM' | 'CSM';
    outputColorSpace: 'sRGB' | 'LinearSRGB' | 'DisplayP3';
  };
  renderingLatencyMs: number;
  confidenceScore: number;
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  zdrCompliant: boolean;
}

export interface LightDefinition {
  lightId: string;
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  color: [number, number, number];
  intensity: number;
  position?: [number, number, number];
  target?: [number, number, number];
  castShadow: boolean;
}

export interface CameraDefinition {
  cameraId: string;
  type: 'perspective' | 'orthographic';
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
  target: [number, number, number];
}

export interface WebGLBridgeInput {
  tenantId: string;
  traceId: string;
  bimResult: BIMExtractionResult;
  renderConfig?: {
    maxLODLevels?: number;
    shadowMap?: WebGLScene['renderPipeline']['shadowMap'];
    antialiasing?: WebGLScene['renderPipeline']['antialiasing'];
  };
}

// ── Material Mapping ──

const MATERIAL_MAP: Record<string, PBRMaterial> = {
  'CONCRETO_ARMADO_FCK30': {
    name: 'Concreto Armado FCK30', baseColor: [0.72, 0.70, 0.68],
    roughness: 0.85, metalness: 0.0, opacity: 1.0,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 1.5, transmission: 0,
  },
  'CONCRETO_ARMADO_FCK25': {
    name: 'Concreto Armado FCK25', baseColor: [0.68, 0.66, 0.64],
    roughness: 0.9, metalness: 0.0, opacity: 1.0,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 1.5, transmission: 0,
  },
  'CONCRETO_ARMADO_FCK35': {
    name: 'Concreto Armado FCK35', baseColor: [0.65, 0.63, 0.61],
    roughness: 0.82, metalness: 0.0, opacity: 1.0,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 1.5, transmission: 0,
  },
  'ALUMINIO_ANODIZADO_VIDRO_DUPLO': {
    name: 'Aluminio Anodizado c/ Vidro Duplo', baseColor: [0.85, 0.85, 0.88],
    roughness: 0.15, metalness: 0.95, opacity: 0.4,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 1.52, transmission: 0.6,
  },
  'MADEIRA_COMPENSADA_CF30': {
    name: 'Madeira Compensada CF30', baseColor: [0.55, 0.38, 0.22],
    roughness: 0.7, metalness: 0.0, opacity: 1.0,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 1.55, transmission: 0,
  },
  'MADEIRA_MDF_ESTOFADO': {
    name: 'Madeira MDF Estofado', baseColor: [0.60, 0.42, 0.28],
    roughness: 0.65, metalness: 0.0, opacity: 1.0,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 1.53, transmission: 0,
  },
  'ACO_INOX_304': {
    name: 'Aco Inox 304', baseColor: [0.75, 0.75, 0.78],
    roughness: 0.2, metalness: 0.98, opacity: 1.0,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 2.5, transmission: 0,
  },
  '_DEFAULT': {
    name: 'Default Material', baseColor: [0.5, 0.5, 0.5],
    roughness: 0.5, metalness: 0.0, opacity: 1.0,
    emissive: [0, 0, 0], emissiveIntensity: 0,
    ior: 1.5, transmission: 0,
  },
};

// ── Mock Mesh Generation ──

function generateBoxMesh(
  element: BIMElement,
  meshId: string,
  lodLevels: number
): MeshData {
  const { minX, minY, minZ, maxX, maxY, maxZ } = element.boundingBox;

  // 8 vertices of a box with normals and UVs
  const vertices: MeshVertex[] = [
    // Front face
    { x: minX, y: minY, z: maxZ, nx: 0, ny: 0, nz: 1, u: 0, v: 0 },
    { x: maxX, y: minY, z: maxZ, nx: 0, ny: 0, nz: 1, u: 1, v: 0 },
    { x: maxX, y: maxY, z: maxZ, nx: 0, ny: 0, nz: 1, u: 1, v: 1 },
    { x: minX, y: maxY, z: maxZ, nx: 0, ny: 0, nz: 1, u: 0, v: 1 },
    // Back face
    { x: maxX, y: minY, z: minZ, nx: 0, ny: 0, nz: -1, u: 0, v: 0 },
    { x: minX, y: minY, z: minZ, nx: 0, ny: 0, nz: -1, u: 1, v: 0 },
    { x: minX, y: maxY, z: minZ, nx: 0, ny: 0, nz: -1, u: 1, v: 1 },
    { x: maxX, y: maxY, z: minZ, nx: 0, ny: 0, nz: -1, u: 0, v: 1 },
    // Top face
    { x: minX, y: maxY, z: maxZ, nx: 0, ny: 1, nz: 0, u: 0, v: 0 },
    { x: maxX, y: maxY, z: maxZ, nx: 0, ny: 1, nz: 0, u: 1, v: 0 },
    { x: maxX, y: maxY, z: minZ, nx: 0, ny: 1, nz: 0, u: 1, v: 1 },
    { x: minX, y: maxY, z: minZ, nx: 0, ny: 1, nz: 0, u: 0, v: 1 },
    // Bottom face
    { x: minX, y: minY, z: minZ, nx: 0, ny: -1, nz: 0, u: 0, v: 0 },
    { x: maxX, y: minY, z: minZ, nx: 0, ny: -1, nz: 0, u: 1, v: 0 },
    { x: maxX, y: minY, z: maxZ, nx: 0, ny: -1, nz: 0, u: 1, v: 1 },
    { x: minX, y: minY, z: maxZ, nx: 0, ny: -1, nz: 0, u: 0, v: 1 },
    // Right face
    { x: maxX, y: minY, z: maxZ, nx: 1, ny: 0, nz: 0, u: 0, v: 0 },
    { x: maxX, y: minY, z: minZ, nx: 1, ny: 0, nz: 0, u: 1, v: 0 },
    { x: maxX, y: maxY, z: minZ, nx: 1, ny: 0, nz: 0, u: 1, v: 1 },
    { x: maxX, y: maxY, z: maxZ, nx: 1, ny: 0, nz: 0, u: 0, v: 1 },
    // Left face
    { x: minX, y: minY, z: minZ, nx: -1, ny: 0, nz: 0, u: 0, v: 0 },
    { x: minX, y: minY, z: maxZ, nx: -1, ny: 0, nz: 0, u: 1, v: 0 },
    { x: minX, y: maxY, z: maxZ, nx: -1, ny: 0, nz: 0, u: 1, v: 1 },
    { x: minX, y: maxY, z: minZ, nx: -1, ny: 0, nz: 0, u: 0, v: 1 },
  ];

  // Two triangles per face, 6 faces = 36 indices
  const indices: number[] = [];
  for (let face = 0; face < 6; face++) {
    const offset = face * 4;
    indices.push(offset, offset + 1, offset + 2);
    indices.push(offset, offset + 2, offset + 3);
  }

  const material = MATERIAL_MAP[element.material] ?? MATERIAL_MAP['_DEFAULT'];

  return {
    meshId,
    parentElementId: element.globalId,
    ifcType: element.ifcType,
    name: element.name,
    vertices,
    indices,
    material,
    boundingBox: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
    },
    triangleCount: 12,
    vertexCount: 24,
    lodLevels,
  };
}

// ── Scene Graph Builder ──

function buildSceneGraph(
  meshes: MeshData[],
  zones: SpatialZone[],
  projectExtent: BIMExtractionResult['projectExtent']
): WebGLScene['sceneGraph'] {
  const nodes: Record<string, SceneNode> = {};

  // Root node
  const rootNodeId = 'SCENE_ROOT';
  nodes[rootNodeId] = {
    nodeId: rootNodeId,
    name: 'Root Scene',
    type: 'group',
    children: ['GROUP_STRUCTURAL', 'GROUP_ARCHITECTURAL', 'GROUP_MEP', 'GROUP_ZONES', 'LIGHT_GROUP'],
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    visible: true,
    castShadow: false,
    receiveShadow: false,
  };

  // Group by entity type
  const typeGroups: Record<string, string[]> = {
    structural: [], architectural: [], mep: [],
  };

  for (const mesh of meshes) {
    const elem = meshes.find(m => m.meshId === mesh.meshId);
    const groupKey = mesh.ifcType.includes('Wall') || mesh.ifcType.includes('Slab') ||
      mesh.ifcType.includes('Column') || mesh.ifcType.includes('Beam')
      ? 'structural'
      : mesh.ifcType.includes('Air') || mesh.ifcType.includes('Pipe') || mesh.ifcType.includes('Cable')
        ? 'mep'
        : 'architectural';

    typeGroups[groupKey].push(mesh.meshId);
  }

  const groupNames: Record<string, string> = {
    structural: 'GROUP_STRUCTURAL',
    architectural: 'GROUP_ARCHITECTURAL',
    mep: 'GROUP_MEP',
  };

  for (const [type, groupNodeId] of Object.entries(groupNames)) {
    nodes[groupNodeId] = {
      nodeId: groupNodeId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Elements`,
      type: 'group',
      children: typeGroups[type],
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      visible: true,
      castShadow: type === 'structural',
      receiveShadow: true,
    };

    // Individual mesh nodes
    for (const meshId of typeGroups[type]) {
      const mesh = meshes.find(m => m.meshId === meshId)!;
      nodes[meshId] = {
        nodeId: meshId,
        name: mesh.name,
        type: 'mesh',
        children: [],
        meshId,
        transform: {
          position: [
            (mesh.boundingBox.min[0] + mesh.boundingBox.max[0]) / 2,
            (mesh.boundingBox.min[1] + mesh.boundingBox.max[1]) / 2,
            (mesh.boundingBox.min[2] + mesh.boundingBox.max[2]) / 2,
          ],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
        visible: true,
        castShadow: type === 'structural',
        receiveShadow: true,
      };
    }
  }

  // Zone group
  const zoneNodeIds = zones.map((z, i) => {
    const zoneNodeId = `ZONE_NODE-${String(i).padStart(3, '0')}`;
    nodes[zoneNodeId] = {
      nodeId: zoneNodeId,
      name: z.name,
      type: 'zone',
      children: [],
      transform: { position: [0, i * 5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      visible: true,
      castShadow: false,
      receiveShadow: false,
    };
    return zoneNodeId;
  });

  nodes['GROUP_ZONES'] = {
    nodeId: 'GROUP_ZONES',
    name: 'Spatial Zones',
    type: 'group',
    children: zoneNodeIds,
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    visible: true,
    castShadow: false,
    receiveShadow: false,
  };

  // Light group
  nodes['LIGHT_GROUP'] = {
    nodeId: 'LIGHT_GROUP',
    name: 'Lights',
    type: 'group',
    children: ['LIGHT_AMBIENT', 'LIGHT_DIR_MAIN', 'LIGHT_POINT_01'],
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    visible: true,
    castShadow: false,
    receiveShadow: false,
  };

  nodes['LIGHT_AMBIENT'] = {
    nodeId: 'LIGHT_AMBIENT', name: 'Ambient Light', type: 'light', children: [],
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    visible: true, castShadow: false, receiveShadow: false,
  };
  nodes['LIGHT_DIR_MAIN'] = {
    nodeId: 'LIGHT_DIR_MAIN', name: 'Main Directional', type: 'light', children: [],
    transform: { position: [10, 20, 10], rotation: [45, -30, 0], scale: [1, 1, 1] },
    visible: true, castShadow: true, receiveShadow: false,
  };
  nodes['LIGHT_POINT_01'] = {
    nodeId: 'LIGHT_POINT_01', name: 'Point Light 01', type: 'light', children: [],
    transform: { position: [5, 2.8, 5], rotation: [0, 0, 0], scale: [1, 1, 1] },
    visible: true, castShadow: true, receiveShadow: false,
  };

  return { rootNodeId, nodes };
}

// ── Main Bridge Function ──

/**
 * Bridges BIM extraction data to WebGL 3D scene representation.
 *
 * Pipeline:
 * 1. Generate mesh geometry from BIM elements (box proxies)
 * 2. Map BIM materials to PBR materials
 * 3. Build hierarchical scene graph with spatial zones
 * 4. Configure lights, camera, and render pipeline
 * 5. Compute VRAM budget and draw call estimates
 * 6. Return structured scene for WebGL renderer
 *
 * @param input - BIM extraction result plus render configuration
 * @returns WebGL scene with meshes, scene graph, and rendering telemetry
 */
export async function bridgeToWebGL(
  input: WebGLBridgeInput
): Promise<WebGLScene> {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  const { bimResult } = input;
  const maxLOD = input.renderConfig?.maxLODLevels ?? 3;

  // ── 1. Generate meshes from BIM elements ──
  const meshes: MeshData[] = bimResult.elements.map((element, i) => {
    return generateBoxMesh(element, `MESH-${String(i).padStart(4, '0')}`, maxLOD);
  });

  // ── 2. Build scene graph ──
  const sceneGraph = buildSceneGraph(meshes, bimResult.spatialZones, bimResult.projectExtent);

  // ── 3. Configure lights ──
  const lights: LightDefinition[] = [
    {
      lightId: 'LIGHT_AMBIENT', type: 'ambient',
      color: [1.0, 0.98, 0.95], intensity: 0.4, castShadow: false,
    },
    {
      lightId: 'LIGHT_DIR_MAIN', type: 'directional',
      color: [1.0, 0.95, 0.9], intensity: 1.2,
      position: [10, 20, 10], target: [0, 0, 0], castShadow: true,
    },
    {
      lightId: 'LIGHT_POINT_01', type: 'point',
      color: [1.0, 0.9, 0.8], intensity: 0.8,
      position: [5, 2.8, 5], castShadow: true,
    },
  ];

  // ── 4. Configure camera ──
  const extent = bimResult.projectExtent;
  const center: [number, number, number] = [
    (extent.minCoord[0] + extent.maxCoord[0]) / 2,
    (extent.minCoord[1] + extent.maxCoord[1]) / 2,
    (extent.minCoord[2] + extent.maxCoord[2]) / 2,
  ];
  const size = Math.max(
    extent.maxCoord[0] - extent.minCoord[0],
    extent.maxCoord[1] - extent.minCoord[1],
    extent.maxCoord[2] - extent.minCoord[2],
    10
  );

  const camera: CameraDefinition = {
    cameraId: 'CAM_PERSPECTIVE_01',
    type: 'perspective',
    fov: 60,
    near: 0.1,
    far: size * 10,
    position: [center[0] + size, center[1] + size * 0.5, center[2] + size],
    target: center,
  };

  // ── 5. Statistics ──
  const totalVertices = meshes.reduce((s, m) => s + m.vertexCount, 0);
  const totalTriangles = meshes.reduce((s, m) => s + m.triangleCount, 0);
  const uniqueMaterials = new Set(meshes.map(m => m.material.name));
  const estimatedDrawCalls = meshes.length + lights.filter(l => l.castShadow).length * 3; // shadow passes

  // VRAM estimate: vertices * 40 bytes (pos+normal+uv) + indices * 4 bytes + textures
  const vertexBufferBytes = totalVertices * 40;
  const indexBufferBytes = totalTriangles * 3 * 4;
  const estimatedVRAM_mb = Math.ceil((vertexBufferBytes + indexBufferBytes + 2_000_000) / 1_048_576); // 2MB for textures

  const octreeDepth = Math.max(1, Math.ceil(Math.log2(meshes.length + 1)));

  // ── 6. Confidence score ──
  const meshCoverage = Math.min(meshes.length / 8, 1.0);
  const lodQuality = maxLOD >= 3 ? 1.0 : 0.7;
  const bimConfidence = bimResult.confidenceScore;

  const confidenceScore = parseFloat(
    (meshCoverage * 0.3 + lodQuality * 0.2 + bimConfidence * 0.5).toFixed(6)
  );

  const renderingLatencyMs = parseFloat((performance.now() - startTime).toFixed(2));

  return {
    traceId: input.traceId,
    timestamp,
    tenantId: input.tenantId,
    sceneGraph,
    meshes,
    lights,
    camera,
    statistics: {
      totalMeshes: meshes.length,
      totalVertices,
      totalTriangles,
      totalSceneNodes: Object.keys(sceneGraph.nodes).length,
      totalMaterials: uniqueMaterials.size,
      estimatedDrawCalls,
      estimatedVRAM_mb,
      octreeDepth,
    },
    renderPipeline: {
      backend: 'WebGL2',
      antialiasing: input.renderConfig?.antialiasing ?? 'MSAA_4X',
      toneMapping: 'ACES_Filmic',
      shadowMap: input.renderConfig?.shadowMap ?? 'PCF_Soft',
      outputColorSpace: 'sRGB',
    },
    renderingLatencyMs,
    confidenceScore,
    dataClassification: 'INTERNAL',
    zdrCompliant: true,
  };
}

// ── Telemetry Helper ──

export interface WebGLTelemetryEntry {
  timestamp: string;
  module: 'WEBGL_BRIDGE';
  status: 'PROCESSING' | 'COMPLETED' | 'ERROR';
  latencyMs: number;
  payload: {
    totalMeshes: number;
    totalVertices: number;
    totalTriangles: number;
    sceneNodes: number;
    materials: number;
    drawCalls: number;
    vramMB: number;
    octreeDepth: number;
    renderBackend: string;
  };
  confidenceScore: number;
}

export function extractTelemetry(result: WebGLScene): WebGLTelemetryEntry {
  return {
    timestamp: result.timestamp,
    module: 'WEBGL_BRIDGE',
    status: result.confidenceScore >= 0.8 ? 'COMPLETED' : 'ERROR',
    latencyMs: result.renderingLatencyMs,
    payload: {
      totalMeshes: result.statistics.totalMeshes,
      totalVertices: result.statistics.totalVertices,
      totalTriangles: result.statistics.totalTriangles,
      sceneNodes: result.statistics.totalSceneNodes,
      materials: result.statistics.totalMaterials,
      drawCalls: result.statistics.estimatedDrawCalls,
      vramMB: result.statistics.estimatedVRAM_mb,
      octreeDepth: result.statistics.octreeDepth,
      renderBackend: result.renderPipeline.backend,
    },
    confidenceScore: result.confidenceScore,
  };
}