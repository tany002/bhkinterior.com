import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Updated imports for standard NPM package structure
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { X, Camera, MousePointer2, Box, Layers, Loader2, AlertTriangle, Download } from 'lucide-react';
import { RoomData, FurnitureBlock } from '../types';

interface ThreeDViewerProps {
  room: RoomData;
  onClose: () => void;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ room, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const [loadingStep, setLoadingStep] = useState<number>(0); 
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- 0. Data Preparation ---
    const sceneData = room.sceneGeneration?.placeholder_layout;
    const fallbackLayout = room.layoutProposals?.[0];
    const viewerSettings = room.sceneGeneration?.viewer_controls;

    if (!sceneData && !fallbackLayout) {
        setError("No layout data available for 3D view.");
        return;
    }

    // --- 1. Init Scene ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1a1a); 
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);

    // --- 2. Camera ---
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5, 5, 5); 
    cameraRef.current = camera;

    // --- 3. Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // --- 4. Environment & Lighting ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    sunLight.position.set(8, 12, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // --- 5. Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Just above floor
    
    // Apply AI-suggested controls if available
    if (viewerSettings) {
        if (viewerSettings.zoom) {
            controls.minDistance = viewerSettings.zoom.min_dist_m || 0.5;
            controls.maxDistance = viewerSettings.zoom.max_dist_m || 10;
        }
        controls.enableRotate = viewerSettings.rotate !== false;
        controls.enablePan = viewerSettings.pan !== false;
        controls.autoRotate = viewerSettings.auto_spin === true;
        controls.autoRotateSpeed = 2.0;
    }
    
    controlsRef.current = controls;

    // --- 6. Build Scene Objects ---
    
    // Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid
    const grid = new THREE.GridHelper(30, 30, 0x555555, 0x333333);
    grid.position.y = 0.005;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    const meshes: THREE.Mesh[] = [];

    // Helper: Smart Color Enhancer
    const getStyledColor = (type: string, providedColor: string) => {
        const t = type.toLowerCase();
        // Check if the provided color is a generic grayscale placeholder
        const isGeneric = ['#cccccc', '#333333', '#555555', '#e5e0d8', '#eeeeee', '#ffffff', '#000000'].includes(providedColor.toLowerCase());
        
        if (isGeneric) {
            // Apply "Imagination Palette"
            if (t.includes('sofa') || t.includes('couch')) return '#334155'; // Slate 700 (Deep Blue/Grey)
            if (t.includes('bed')) return '#e2e8f0'; // Slate 200 (Clean White/Grey)
            if (t.includes('table') || t.includes('desk') || t.includes('stand') || t.includes('dining')) return '#78350f'; // Amber 900 (Deep Walnut)
            if (t.includes('wardrobe') || t.includes('cabinet') || t.includes('shelf')) return '#f1f5f9'; // Slate 100 (White Wood)
            if (t.includes('tv') || t.includes('screen')) return '#0f172a'; // Slate 900 (Black screen)
            if (t.includes('plant') || t.includes('tree')) return '#15803d'; // Green 700
            if (t.includes('rug') || t.includes('carpet')) return '#d6d3d1'; // Stone 300
            if (t.includes('chair') || t.includes('stool')) return '#a16207'; // Yellow 700 (Leather-ish)
        }
        return providedColor;
    };

    // Helper to add block
    const addBlock = (
        type: string, 
        x: number, 
        z: number, 
        w: number, 
        d: number, 
        h: number, 
        rot: number, 
        colorHex: string
    ) => {
        let geo: THREE.BufferGeometry;
        const safeType = type.toLowerCase();
        
        // Improve shapes based on type
        if (safeType.includes('table') && !safeType.includes('side')) {
             // Round tables
             geo = new THREE.CylinderGeometry(Math.min(w,d)/2, Math.min(w,d)/2, h, 32);
        } else if (safeType.includes('lamp') || safeType.includes('plant')) {
             geo = new THREE.CylinderGeometry(w/4, w/2, h, 16);
        } else {
             // Standard box
             geo = new THREE.BoxGeometry(w, h, d);
        }

        // Material Logic based on type
        let roughness = 0.6;
        let metalness = 0.1;
        
        if (safeType.includes('sofa') || safeType.includes('bed') || safeType.includes('chair') || safeType.includes('rug')) {
            roughness = 1.0; // Fabric (Matte)
            metalness = 0.0;
        } else if (safeType.includes('tv') || safeType.includes('metal') || safeType.includes('fridge')) {
            roughness = 0.2; // Glossy/Metal
            metalness = 0.8;
        } else if (safeType.includes('table') || safeType.includes('cabinet') || safeType.includes('wardrobe')) {
            roughness = 0.4; // Polished wood/glass
            metalness = 0.0;
        }

        // Enhance Color
        const finalColor = getStyledColor(type, colorHex);

        const mat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(finalColor), 
            roughness,
            metalness
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, h / 2, z);
        mesh.rotation.y = -(rot * (Math.PI / 180));
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { label: type };
        
        scene.add(mesh);
        meshes.push(mesh);
    };

    if (sceneData && sceneData.furniture_blocks) {
        sceneData.furniture_blocks.forEach((block: FurnitureBlock) => {
            addBlock(
                block.type, 
                block.x_m, 
                block.y_m, 
                block.w_m, 
                block.d_m, 
                block.h_m || 0.8, 
                block.rotation_deg || 0,
                block.color_hex || '#cccccc'
            );
        });
        setLoadingStep(3); 
    } else if (fallbackLayout) {
        const offsetX = 2.5; 
        const offsetZ = 2.5;
        fallbackLayout.placements.forEach((item) => {
            let h = 0.8;
            let col = '#cccccc';
            const t = item.item_type.toLowerCase();
            if (t.includes('sofa')) { h = 0.8; col = '#cccccc'; } // Use generic for auto-enhancer to pick up
            else if (t.includes('table')) { h = 0.75; col = '#cccccc'; }
            else if (t.includes('bed')) { h = 0.6; col = '#cccccc'; }
            else if (t.includes('wardrobe')) { h = 2.0; col = '#cccccc'; }
            else if (t.includes('tv')) { h = 0.5; col = '#333333'; }

            addBlock(
                item.item_type, 
                item.x_m - offsetX, 
                item.y_m - offsetZ, 
                item.width_m, 
                item.depth_m, 
                h, 
                item.rotation_deg, 
                col
            );
        });
        setLoadingStep(2);
    }

    // --- 7. Auto-Fit Camera ---
    if (meshes.length > 0) {
        const box = new THREE.Box3();
        meshes.forEach(m => box.expandByObject(m));
        
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2)); 
        cameraZ *= 1.8; // Zoom out slightly more for better overview

        const direction = new THREE.Vector3(1, 1, 1).normalize(); 
        const camPos = center.clone().add(direction.multiplyScalar(cameraZ));

        camera.position.copy(camPos);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    }

    // --- 8. Loop ---
    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current) return;
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (containerRef.current && rendererRef.current) {
            containerRef.current.removeChild(rendererRef.current.domElement);
        }
        renderer.dispose();
    };
  }, [room]);

  const handleScreenshot = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      const renderer = rendererRef.current;
      const originalSize = new THREE.Vector2();
      renderer.getSize(originalSize);

      renderer.setSize(3840, 2160);
      renderer.render(sceneRef.current, cameraRef.current);
      const dataURL = renderer.domElement.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `LuxeInterior-3D-${Date.now()}.png`;
      link.click();

      renderer.setSize(originalSize.x, originalSize.y);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const mouse = new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
      );
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children);
      
      const furniture = intersects.find(hit => hit.object.userData.label);
      
      if (furniture) {
          setSelectedItem(furniture.object.userData.label);
          const mesh = furniture.object as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const originalEmissive = mat.emissive.getHex();
          
          mat.emissive.setHex(0xaaaaaa);
          setTimeout(() => {
             mat.emissive.setHex(originalEmissive);
          }, 300);
      } else {
          setSelectedItem(null);
      }
  };

  if (error) {
      return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">3D View Unavailable</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button onClick={onClose} className="bg-white text-black px-6 py-2 rounded-full font-bold">Close</button>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
      <div ref={containerRef} className="w-full h-full cursor-move" onClick={handleCanvasClick} />
      
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
          <div>
              <h2 className="text-white font-serif text-3xl font-bold drop-shadow-lg tracking-tight">3D Ultra Mode</h2>
              <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                       <div className={`h-2 w-2 rounded-full ${loadingStep === 3 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                       <span className="text-white/80 text-sm font-medium tracking-wide uppercase">
                           {loadingStep === 3 ? "High Fidelity" : "Standard Geometry"}
                       </span>
                  </div>
              </div>
          </div>
          <button onClick={onClose} className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors">
              <X size={32} />
          </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between pointer-events-none">
          <div className="max-w-md hidden md:block">
               <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                  Interact with the scene naturally.
               </p>
               <div className="flex gap-4 mt-4 text-white/50 text-xs uppercase tracking-wider">
                   <span className="flex items-center gap-1"><MousePointer2 size={12} /> Drag to Rotate</span>
                   <span className="flex items-center gap-1"><Layers size={12} /> Scroll to Zoom</span>
                   <span className="flex items-center gap-1"><Box size={12} /> Tap to Select</span>
               </div>
          </div>

          <div className="flex gap-4 pointer-events-auto">
               {selectedItem && (
                   <div className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-lg font-bold shadow-lg animate-in slide-in-from-bottom-2">
                       {selectedItem}
                   </div>
               )}
               <button onClick={handleScreenshot} className="bg-white text-black hover:bg-stone-200 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95">
                  <Download size={20} /> Save 3D Image
               </button>
          </div>
      </div>
    </div>
  );
};