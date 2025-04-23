import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";

import { createSignal, For, onCleanup, onMount, createEffect } from "solid-js";

//■

function Life(){
  const rows = 70;
  const cols = 120;
  const cellSize = 10;
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement | undefined>(undefined);


  const [grid, setGrid] = createSignal(
    Array.from({ length: rows},
      () => Array.from({ length: cols}, () => Math.random() < 0.5)
  ));
  
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

  const draw = () => {
    const ctx = canvasRef()?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0,0, cols * cellSize, rows * cellSize);
    const data = grid();
    for (let row=0; row<rows; row++){
      for (let col=0; col<cols; col++){
        ctx.fillStyle = data[row][col] ? 'black' : 'white';
        ctx.fillRect(col* cellSize, row * cellSize, cellSize, cellSize)
        //ctx.fillStyle() perhaps this one can spice things up?
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
    <canvas
    ref={setCanvasRef}
    width={cols*cellSize}
    style={{border: '1px solid #ccc'}}
    />
  );
}

export default Life;