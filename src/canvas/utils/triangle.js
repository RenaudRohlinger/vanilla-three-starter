import { BufferAttribute, BufferGeometry } from 'three';

// Define the vertices for the triangle (x, y, z for each vertex)
const vertices = new Float32Array([
  -1.0,
  -1.0,
  0.0, // Vertex 1 (x, y, z)
  3.0,
  -1.0,
  0.0, // Vertex 2 (x, y, z)
  -1.0,
  3.0,
  0.0, // Vertex 3 (x, y, z)
]);

// Create a new BufferGeometry
const geometry = new BufferGeometry();

// Set the 'position' attribute for the geometry
geometry.setAttribute('position', new BufferAttribute(vertices, 3)); // 3 values per vertex (x, y, z)

export default geometry;
