
import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  Square, 
  Circle as CircleIcon, 
  ArrowRight, 
  Move, 
  Pencil, 
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

interface DrawIOEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  endX?: number;
  endY?: number;
}

const DrawIOEditor: React.FC<DrawIOEditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<'select' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'pencil'>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#1a73e8');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [undoStack, setUndoStack] = useState<Shape[][]>([]);
  const [redoStack, setRedoStack] = useState<Shape[][]>([]);
  
  useEffect(() => {
    // Parse initialContent if it exists
    if (initialContent && initialContent.trim()) {
      try {
        const parsedContent = JSON.parse(initialContent);
        if (Array.isArray(parsedContent)) {
          setShapes(parsedContent);
        }
      } catch (err) {
        console.error("Error parsing initialContent:", err);
      }
    }
  }, [initialContent]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom
    const scale = zoom / 100;
    ctx.save();
    ctx.scale(scale, scale);
    
    // Draw grid
    drawGrid(ctx, canvas.width / scale, canvas.height / scale);
    
    // Draw shapes
    shapes.forEach((shape) => {
      const isSelected = shape.id === selectedShape;
      drawShape(ctx, shape, isSelected);
    });
    
    // Draw current pencil path if drawing
    if (isDrawing && tool === 'pencil' && currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
    
    ctx.restore();
  }, [shapes, selectedShape, zoom, isDrawing, currentPath, tool, color, strokeWidth]);
  
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    
    ctx.stroke();
  };
  
  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean) => {
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = `${shape.color}20`; // 20% opacity version of the color
    ctx.lineWidth = strokeWidth;
    
    switch (shape.type) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width || 100, shape.height || 80);
        ctx.fill();
        ctx.stroke();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius || 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case 'arrow':
        if (shape.endX !== undefined && shape.endY !== undefined) {
          drawArrow(ctx, shape.x, shape.y, shape.endX, shape.endY, shape.color);
        }
        break;
      case 'line':
        if (shape.endX !== undefined && shape.endY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.endX, shape.endY);
          ctx.stroke();
        }
        break;
    }
    
    // Draw selection indicator
    if (isSelected) {
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      
      if (shape.type === 'rectangle') {
        ctx.beginPath();
        ctx.rect(
          shape.x - 4, 
          shape.y - 4, 
          (shape.width || 100) + 8, 
          (shape.height || 80) + 8
        );
        ctx.stroke();
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(
          shape.x, 
          shape.y, 
          (shape.radius || 40) + 4, 
          0, 
          Math.PI * 2
        );
        ctx.stroke();
      } else if ((shape.type === 'arrow' || shape.type === 'line') && 
                shape.endX !== undefined && 
                shape.endY !== undefined) {
        ctx.beginPath();
        ctx.rect(
          Math.min(shape.x, shape.endX) - 4,
          Math.min(shape.y, shape.endY) - 4,
          Math.abs(shape.endX - shape.x) + 8,
          Math.abs(shape.endY - shape.y) + 8
        );
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }
  };
  
  const drawArrow = (
    ctx: CanvasRenderingContext2D, 
    fromX: number, 
    fromY: number, 
    toX: number, 
    toY: number,
    color: string
  ) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);
    
    if (tool === 'select') {
      const clickedShape = findShapeAt(x, y);
      setSelectedShape(clickedShape?.id || null);
      
      if (clickedShape) {
        setIsDragging(true);
        setDragStartPos({ x, y });
      }
    } else if (tool === 'rectangle') {
      const newShape: Shape = {
        id: Date.now().toString(),
        type: 'rectangle',
        x,
        y,
        width: 100,
        height: 80,
        color
      };
      
      addShape(newShape);
      setSelectedShape(newShape.id);
    } else if (tool === 'circle') {
      const newShape: Shape = {
        id: Date.now().toString(),
        type: 'circle',
        x,
        y,
        radius: 40,
        color
      };
      
      addShape(newShape);
      setSelectedShape(newShape.id);
    } else if (tool === 'arrow' || tool === 'line') {
      const newShape: Shape = {
        id: Date.now().toString(),
        type: tool,
        x,
        y,
        endX: x,
        endY: y,
        color
      };
      
      addShape(newShape);
      setSelectedShape(newShape.id);
      setIsDragging(true);
      setDragStartPos({ x, y });
    } else if (tool === 'pencil') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);
    
    if (isDragging && selectedShape) {
      const selectedShapeObj = shapes.find(s => s.id === selectedShape);
      
      if (selectedShapeObj) {
        if (selectedShapeObj.type === 'arrow' || selectedShapeObj.type === 'line') {
          // Update end point of arrow or line
          setShapes(shapes.map(shape => 
            shape.id === selectedShape 
              ? { ...shape, endX: x, endY: y } 
              : shape
          ));
        } else {
          // Move other shapes
          const deltaX = x - dragStartPos.x;
          const deltaY = y - dragStartPos.y;
          
          setShapes(shapes.map(shape => 
            shape.id === selectedShape 
              ? { ...shape, x: shape.x + deltaX, y: shape.y + deltaY } 
              : shape
          ));
          setDragStartPos({ x, y });
        }
      }
    } else if (isDrawing && tool === 'pencil') {
      setCurrentPath([...currentPath, { x, y }]);
    }
  };
  
  const handleMouseUp = () => {
    if (isDrawing && tool === 'pencil' && currentPath.length > 1) {
      // Add the current pencil path as a series of line segments
      const pathPoints = [...currentPath];
      
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const newLine: Shape = {
          id: `${Date.now()}-${i}`,
          type: 'line',
          x: pathPoints[i].x,
          y: pathPoints[i].y,
          endX: pathPoints[i + 1].x,
          endY: pathPoints[i + 1].y,
          color
        };
        
        setShapes(prev => [...prev, newLine]);
      }
    }
    
    setIsDrawing(false);
    setIsDragging(false);
    setCurrentPath([]);
    
    // Save content after changes
    saveContent();
  };
  
  const findShapeAt = (x: number, y: number) => {
    // Check in reverse order to select the shape on top
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      
      switch (shape.type) {
        case 'rectangle':
          if (
            x >= shape.x && 
            x <= shape.x + (shape.width || 100) && 
            y >= shape.y && 
            y <= shape.y + (shape.height || 80)
          ) {
            return shape;
          }
          break;
        case 'circle':
          const distance = Math.sqrt(
            Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)
          );
          if (distance <= (shape.radius || 40)) {
            return shape;
          }
          break;
        case 'arrow':
        case 'line':
          if (
            shape.endX !== undefined && 
            shape.endY !== undefined &&
            isPointNearLine(x, y, shape.x, shape.y, shape.endX, shape.endY, 10)
          ) {
            return shape;
          }
          break;
      }
    }
    
    return null;
  };
  
  const isPointNearLine = (
    x: number, 
    y: number, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    tolerance: number
  ) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) {
      param = dot / len_sq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    
    return Math.sqrt(dx * dx + dy * dy) < tolerance;
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };
  
  const handleDelete = () => {
    if (selectedShape) {
      addToUndoStack();
      setShapes(shapes.filter(shape => shape.id !== selectedShape));
      setSelectedShape(null);
      saveContent();
    }
  };
  
  const handleDuplicate = () => {
    if (selectedShape) {
      const selectedShapeObj = shapes.find(s => s.id === selectedShape);
      
      if (selectedShapeObj) {
        const newShape = {
          ...selectedShapeObj,
          id: Date.now().toString(),
          x: selectedShapeObj.x + 20,
          y: selectedShapeObj.y + 20
        };
        
        addToUndoStack();
        setShapes([...shapes, newShape]);
        setSelectedShape(newShape.id);
        saveContent();
      }
    }
  };
  
  const addToUndoStack = () => {
    setUndoStack([...undoStack, [...shapes]]);
    setRedoStack([]);
  };
  
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, undoStack.length - 1);
      
      setRedoStack([...redoStack, [...shapes]]);
      setShapes(lastState);
      setUndoStack(newUndoStack);
      saveContent();
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, redoStack.length - 1);
      
      setUndoStack([...undoStack, [...shapes]]);
      setShapes(nextState);
      setRedoStack(newRedoStack);
      saveContent();
    }
  };
  
  const addShape = (shape: Shape) => {
    addToUndoStack();
    setShapes([...shapes, shape]);
  };
  
  const saveContent = () => {
    if (onContentChange) {
      const content = JSON.stringify(shapes);
      onContentChange(content);
    }
  };
  
  const handleSave = () => {
    saveContent();
    toast({
      title: "Diagram saved",
      description: "Your diagram has been saved successfully"
    });
  };
  
  useEffect(() => {
    // Set initial canvas size
    if (canvasRef.current && containerRef.current) {
      const container = containerRef.current;
      canvasRef.current.width = container.clientWidth;
      canvasRef.current.height = container.clientHeight - 60; // Subtract toolbar height
    }
    
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        canvasRef.current.width = container.clientWidth;
        canvasRef.current.height = container.clientHeight - 60;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className={cn("flex flex-col h-full bg-background", className)} ref={containerRef}>
      <div className="border-b p-2 flex flex-wrap items-center justify-between gap-2 bg-background">
        <div className="flex items-center gap-2">
          <Tabs value={tool} onValueChange={(value) => setTool(value as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="select" className="flex items-center gap-1">
                <Move className="h-4 w-4" /> Select
              </TabsTrigger>
              <TabsTrigger value="rectangle" className="flex items-center gap-1">
                <Square className="h-4 w-4" /> Rectangle
              </TabsTrigger>
              <TabsTrigger value="circle" className="flex items-center gap-1">
                <CircleIcon className="h-4 w-4" /> Circle
              </TabsTrigger>
              <TabsTrigger value="arrow" className="flex items-center gap-1">
                <ArrowRight className="h-4 w-4" /> Arrow
              </TabsTrigger>
              <TabsTrigger value="pencil" className="flex items-center gap-1">
                <Pencil className="h-4 w-4" /> Pencil
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: color }} 
                />
                Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="grid grid-cols-5 gap-1">
                {[
                  '#1a73e8', '#d93025', '#188038', '#8430ce', '#f09300',
                  '#34a853', '#ea4335', '#4285f4', '#fbbc04', '#202124',
                  '#5f6368', '#dadce0', '#f1f3f4', '#9aa0a6', '#3c4043'
                ].map((c) => (
                  <button
                    key={c}
                    className={`h-6 w-6 rounded-full border ${color === c ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Width:</span>
            <Slider
              value={[strokeWidth]}
              min={1}
              max={8}
              step={1}
              className="w-24"
              onValueChange={(value) => setStrokeWidth(value[0])}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleUndo}
            disabled={undoStack.length === 0}
          >
            <Undo2 size={16} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRedo}
            disabled={redoStack.length === 0}
          >
            <Redo2 size={16} />
          </Button>
          
          {selectedShape && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDuplicate}
              >
                <Copy size={16} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
          
          <div className="flex items-center gap-1 bg-muted rounded p-1">
            <Button size="icon" variant="ghost" onClick={handleZoomOut}>
              <ZoomOut size={16} />
            </Button>
            <span className="text-xs w-12 text-center">{zoom}%</span>
            <Button size="icon" variant="ghost" onClick={handleZoomIn}>
              <ZoomIn size={16} />
            </Button>
          </div>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-accent/10">
        <canvas
          ref={canvasRef}
          className="bg-white shadow-md mx-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default DrawIOEditor;
