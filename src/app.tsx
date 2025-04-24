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

  type Cell = {
    alive: boolean;
    neighbors: number;
  }
  
  const applyRules = (grid: boolean[][], row: number, col: number): Cell => {
    //If at the edge, just kill it
    const cell : Cell = { alive: false, neighbors: 0}
    cell.neighbors = 0;

    if (row === 0 || row === rows -1 ||
      col === 0 || col === cols-1){
        return cell;
      }

    //(I think I might have inverted this compass terminology, just heads up!)
    //North
    if (grid[row][col+1]){cell.neighbors += 1}
    //North East
    if (grid[row+1][col+1]){cell.neighbors += 1}
    //East
    if (grid[row+1][col]){cell.neighbors += 1}
    //South East
    if (grid[row+1][col-1]){cell.neighbors +=1}
    //South
    if(grid[row][col-1]){cell.neighbors +=1}
    //South West
    if(grid[row-1][col-1]){cell.neighbors+=1}
    //West
    if(grid[row-1][col]){cell.neighbors+=1}
    //North West
    if(grid[row-1][col+1]){cell.neighbors+=1}
  
    // Any live cell with fewer than two live neighbors dies, as if by under-population.
    if (grid[row][col] && cell.neighbors < 2){cell.alive=false}
    // Any live cell with two or three live neighbors lives on to the next generation.
    else if (grid[row][col] && (cell.neighbors===2 || cell.neighbors ===3)){cell.alive=true}
    // Any live cell with more than three live neighbors dies, as if by overpopulation.
    else if((grid[row][col]) && (cell.neighbors >= 3)){cell.alive=false}
    // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
    else if(!grid[row][col] && (cell.neighbors===3)){cell.alive=true}
  
    //I don't think we have any undefined behavior, but just incase, kill it?
    return cell
  }

  const step = () => {
    const current = grid();
    const next = current.map((row, rowIndex) =>
      row.map((_, colIndex) => {
        return applyRules(current, rowIndex, colIndex).alive
      })
    );
    setGrid(next)

  };

  
  
  const draw = () => {
    const ctx = canvasRef()?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0,0, cols * cellSize, rows * cellSize);
    const data = grid();
    for (let row=0; row<rows; row++){
      for (let col=0; col<cols; col++){
        const cell = data[row][col];
        if (cell) {
          ctx.fillStyle = data[row][col] ? 'black':'white';
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

        }
      }
    }
  };



  onMount(() => {
    const interval = setInterval(() => {
      step();
      draw();
    }, 200);
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