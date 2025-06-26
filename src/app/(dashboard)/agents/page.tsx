import {
    AgentsView,
    AgentsViewError,
    AgentsViewLoading,
} from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const Page = async () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions()); // prefetch to use suspense query properly

    return (
        //must wrap in hydration boundary for prefetching to work
        <HydrationBoundary state={dehydrate(queryClient)}> 
            <Suspense fallback={<AgentsViewLoading />}>
                <ErrorBoundary fallback={<AgentsViewError />}>
                    <AgentsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default Page;
