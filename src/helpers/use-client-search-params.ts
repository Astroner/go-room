"use client"

import { useMemo } from "react"

export const useClientSearchParams = () => {
    const search = useMemo(() => {
        if(global.location) {
            const params = new URLSearchParams(global.location.search);
            return params;
        } else {
            return new URLSearchParams();
        }
    }, [])

    return search;
}