"use client"

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { App } from "../graphics/app.class";

import cn from "./page.module.scss";
import { BoardSize } from "../game/game.types";
import { useClientSearchParams } from "../helpers/use-client-search-params";
import { Go } from "../game/go/go.class";

const MainPage: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [app, setApp] = useState<App | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: .5 })

    const [isVisible, setIsVisible] = useState(false);

    const params = useClientSearchParams();
    
    const boardSize = useMemo(() => {
        const size = params.get("size");
        switch(size) {
            case "9": return BoardSize.S9;
            default:
                return BoardSize.S13;
        }

    }, [params])

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if(!canvas || !container) return;

        setApp(new App(
            canvas,
            container.clientWidth,
            container.clientHeight,
        ))
        
        return () => {
            setApp(null);
        }
    }, [])

    useEffect(() => {
        const container = containerRef.current;
        if(!app || !container) return;

        const game = new Go(boardSize);

        app.start(game)
            .then(() => setIsVisible(true))

        const handler = () => {
            app.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', handler);

        return () => {
            app.stop()

            window.removeEventListener('resize', handler);
        }
    }, [app, boardSize])


    return (
        <div 
            ref={containerRef} 
            className={cn.root} 
        >
            {
                <div className={isVisible ? cn['placeholder--hidden'] : cn['placeholder--visible']}>
                    GO room
                    <div className={cn.loader} />
                </div>
            }
            <canvas ref={canvasRef} />
        </div>
    )
}

export default MainPage