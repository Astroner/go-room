import { FC, useEffect, useMemo, useState } from "react";
import { Go } from "../game/go/go.class";
import { BoardSize, StoneColor } from "../game/game.types";

const CELL_SIZE = 100;

export type GoClassProps = {
    size: BoardSize
}

export const GoClass: FC<GoClassProps> = (props) => {
    const game = useMemo(() => new Go(props.size), [props.size]);
    
    const [board, setBoard] = useState(() => game.getGameState());

    useEffect(() => {
        if(!game) return;

        game.onStonePlace = () => {
            setBoard(game.getGameState());
        }

        game.onStonesRemove = () => {
            setBoard(game.getGameState());
        }

        game.onGameError = text => alert(text);

        return () => {
            delete game.onStonePlace;
            delete game.onStonesRemove;
            delete game.onGameError;
        }
    }, [game])
    
    return (
        <div>
            {board.map((row, i) => (
                <div key={i} style={{ display: "flex" }}>
                    {row.map((col, j) => (
                        <div 
                            key={j}
                            style={{ 
                                width: CELL_SIZE, 
                                height: CELL_SIZE, 
                                position: "relative", 
                                border: "1px solid black",
                                backgroundColor: col.type === "empty" ? "brown" : col.color === StoneColor.WHITE ? "white" : "black",
                                color: "magenta",
                                textAlign: 'center'
                            }} 
                            onClick={() => game.placeStone(i, j)}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, fontSize: 10 }}>
                                {i}, {j}
                            </div>
                            {
                                col.type === "empty"
                                ? Array.from(col.attachedGroups.keys()).map((gID, k) => (
                                    <div key={k}>
                                        {gID}
                                    </div>
                                ))
                                : col.groupID
                            }
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}