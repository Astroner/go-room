import { FC, useEffect, useMemo, useState } from "react";
import { Go, StoneColor } from "../go/go.class";

const CELL_SIZE = 100;
const BOARD_SIZE = 9;

export const SimpleBoard: FC = () => {
    const game = useMemo(() => new Go(BOARD_SIZE), []);
    
    const [board, setBoard] = useState(() => game.getGameState());

    useEffect(() => {
        if(!game) return;

        game.onStonePlaced = () => {
            setBoard(game.getGameState());
        }

        game.onStoneRemoved = () => {
            setBoard(game.getGameState());
        }

        return () => {
            delete game.onStonePlaced;
            delete game.onStoneRemoved;
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