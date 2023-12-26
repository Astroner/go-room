"use client"

import { FC, useMemo } from "react";
import { GoClass } from "../go-class.component";
import { BoardSize } from "@/src/game/game.types";
import { useSearchParams } from "next/navigation";


export const ClassTest: FC = () => {

    const params = useSearchParams();
    
    const boardSize = useMemo(() => {
        const size = params.get("size");
        switch(size) {
            case "9": return BoardSize.S9;
            default:
                return BoardSize.S13;
        }

    }, [params])

    return (
        <GoClass size={boardSize} />
    )
}

export default ClassTest;