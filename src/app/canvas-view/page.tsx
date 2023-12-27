"use client"

import { BoardSize, StoneColor } from "@/src/game/game.types";
import { CanvasView } from "@/src/graphics/view/canvas.view";
import { FC, useEffect, useRef, useState } from "react";

const CanvasViewPage: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [view, setView] = useState<CanvasView | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if(!canvas) return;
        setView(new CanvasView(window.innerWidth, window.innerHeight, canvas));

        return () => {
            setView(null);
        }
    }, [])

    useEffect(() => {
        if(!view) return;

        let currentColor = StoneColor.BLACK;

        const sub = view.onBoardClick((x, y) => {
            console.log(`Board Click: ${x} ${y}`);
            view.addStone(currentColor, x, y);

            if(currentColor === StoneColor.WHITE) {
                currentColor = StoneColor.BLACK;
            } else {
                currentColor = StoneColor.WHITE
            }

            view.setCurrentColor(currentColor);
        })

        view.init(BoardSize.S9);

        return () => {
            sub.unsubscribe();
            view.destroy();
        }
    }, [view])

    return (
        <canvas ref={canvasRef} />
    )
}

export default CanvasViewPage;