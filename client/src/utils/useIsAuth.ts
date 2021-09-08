import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const  meQuery = useMeQuery();
    const router = useRouter();
    useEffect(() => {
        if (!meQuery.loading && !meQuery?.data?.me) {
            router.replace("/login?next=" + router.pathname);
        } 
    }, [meQuery, router]);
}