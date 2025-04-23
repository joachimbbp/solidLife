import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";

import { createSignal, For, onCleanup, onMount, createEffect, Show } from "solid-js";

//■

function Life(){
  const rows = 70;
  const cols = 120;
  const cellSize = 10;
  const speed = 80; //lower is faster
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement | undefined>();
  const [isHolding, setIsHolding] = createSignal(false);
  const [startPos, setStartPos] = createSignal<{ x: number; y: number } | null>(null);
  const [isErasing, setIsErasing] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);

  const [grid, setGrid] = createSignal(
    Array.from({ length: rows},
      () => Array.from({ length: cols}, () => false)
  ));

  onMount(() => {
    setMounted(true)
    const canvas = canvasRef();
    if (!canvas) return;
  })
  
  const applyRules = (grid: boolean[][], row: number, col: number): boolean => {
    //If at the edge, just kill it
    if (row === 0 || row === rows -1 ||
      col === 0 || col === cols-1){
        return false;
      }

    let neighbors = 0;
    //(I think I might have inverted this compass terminology, just heads up!)
    //North
    if (grid[row][col+1]){neighbors += 1}
    //North East
    if (grid[row+1][col+1]){neighbors += 1}
    //East
    if (grid[row+1][col]){neighbors += 1}
    //South East
    if (grid[row+1][col-1]){neighbors +=1}
    //South
    if(grid[row][col-1]){neighbors +=1}
    //South West
    if(grid[row-1][col-1]){neighbors+=1}
    //West
    if(grid[row-1][col]){neighbors+=1}
    //North West
    if(grid[row-1][col+1]){neighbors+=1}
  
    // Any live cell with fewer than two live neighbors dies, as if by under-population.
    if (grid[row][col] && neighbors < 2){return false}
    // Any live cell with two or three live neighbors lives on to the next generation.
    if (grid[row][col] && (neighbors===2 || neighbors ===3)){return true}
    // Any live cell with more than three live neighbors dies, as if by overpopulation.
    if((grid[row][col]) && (neighbors >= 3)){return false}
    // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
    if(!grid[row][col] && (neighbors===3)){return true}
  
    //I don't think we have any undefined behavior, but just incase, kill it?
    return false
  }

  const step = () => {
    const current = grid();
    const next = current.map((row, rowIndex) =>
      row.map((_, colIndex) => {
        return applyRules(current, rowIndex, colIndex)
      })
    );
    setGrid(next)
  };

  
  type NeighborMap = {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
    northEast?: boolean;
    northWest?: boolean;
    southEast?: boolean;
    southWest?: boolean;
  };
  
  function drawTiledCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    neighbors: NeighborMap
  ): void {
    const r = size / 3; // corner radius
  
    ctx.beginPath();
  
    // Start top-left corner
    if (!neighbors.north && !neighbors.west) {
      ctx.moveTo(x + r, y);
    } else {
      ctx.moveTo(x, y);
    }
  
    // Top edge
    if (!neighbors.north) {
      ctx.lineTo(x + size - r, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + r); // Top-right corner
    } else {
      ctx.lineTo(x + size, y);
    }
  
    // Right edge
    if (!neighbors.east) {
      ctx.lineTo(x + size, y + size - r);
      ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size); // Bottom-right
    } else {
      ctx.lineTo(x + size, y + size);
    }
  
    // Bottom edge
    if (!neighbors.south) {
      ctx.lineTo(x + r, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - r); // Bottom-left
    } else {
      ctx.lineTo(x, y + size);
    }
  
    // Left edge
    if (!neighbors.west) {
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y); // Back to top-left
    } else {
      ctx.lineTo(x, y);
    }
  
    ctx.closePath();
    ctx.fill();
  }
  
  const draw = () => {
    const ctx = canvasRef()?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0,0, cols * cellSize, rows * cellSize);
    const data = grid();
    for (let row=0; row<rows; row++){
      for (let col=0; col<cols; col++){
        const cell = data[row][col];
        if (cell) {
          drawTiledCell(ctx, col * cellSize, row * cellSize, cellSize, {
            north: data[row - 1]?.[col] ?? false,
            south: data[row + 1]?.[col] ?? false,
            east: data[row]?.[col + 1] ?? false,
            west: data[row]?.[col - 1] ?? false,
          });
        }
      }
    }
  };



  onMount(() => {
    const interval = setInterval(() => {
      step();
      draw();
    }, speed);
    onCleanup(() => clearInterval(interval))
  });
  return (
    <Show when={mounted()}>
      <canvas
      onContextMenu={(e) => e.preventDefault()}
        ref={(el) => {
          setCanvasRef(el)
          
          const getMousePos = (e: PointerEvent) =>{
            const rect = el.getBoundingClientRect();
            return {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            };
          };
          const handlePointerDown = (e: PointerEvent) => {
            const pos = getMousePos(e);
            setIsHolding(true);
            setStartPos(pos);
            const erasing = e.button === 2;
            setIsErasing(erasing);
            const row = Math.floor(pos.y / cellSize);
            const col = Math.floor(pos.x / cellSize);
            setGrid(prev =>
              prev.map((r, rIdx) =>
                r.map((c, cIdx) =>
                  rIdx === row && cIdx === col ? !erasing : c
                )
              )
            );
          };
          const handlePointerMove = (e: PointerEvent) => {
            if (isHolding()) {
              const pos = getMousePos(e);
            setIsHolding(true);
            setStartPos(pos);
            const erasing = isErasing();
            setIsErasing(erasing);
            const row = Math.floor(pos.y / cellSize);
            const col = Math.floor(pos.x / cellSize);
            setGrid(prev =>
              prev.map((r, rIdx) =>
                r.map((c, cIdx) =>
                  rIdx === row && cIdx === col ? !erasing : c
                )
              )
            );
            }
          };
          
      
          const handlePointerUp = () => {
            setIsHolding(false);
          };
      
          el.addEventListener("pointerdown", handlePointerDown);
          el.addEventListener("pointermove", handlePointerMove);
          window.addEventListener("pointerup", handlePointerUp);
      
          onCleanup(() => {
            el.removeEventListener("pointerdown", handlePointerDown);
            el.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
          });
        }}
        width={cols*cellSize}
        height={rows*cellSize}
        style={{border: '1px solid #ccc'}}
      />
    </Show>
  );
}

export default Life;