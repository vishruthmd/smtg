import { MeetingGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { meetingsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/generated-avatar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { CommandSelect } from "@/components/command-select";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";
import { MeetingJoinLink } from "./meeting-join-link";

interface MeetingFormProps {
    onSuccess?: (id?: string) => void;
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues,
}: MeetingFormProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
    const [agentSearch, setAgentSearch] = useState("");
    const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);

    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch,
        })
    );

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: async (data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                );
                // Set the created meeting ID to show the join link
                setCreatedMeetingId(data.id);
                // Don't call onSuccess yet, wait for user to acknowledge the join link
            },
            onError: (error) => {
                toast.error(error.message);
                // if error is forbidden redirect to "/upgrade" so that they can pay
            },
        })
    );

    const updateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({})
                );
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.meetings.getOne.queryOptions({
                            id: initialValues.id,
                        })
                    );
                }
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);
                // if error is forbidden redirect to "/upgrade" so that they can pay
            },
        })
    );

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? "",
        },
    });

    const isEdit = !!initialValues?.id;
    const isPending = createMeeting.isPending || updateMeeting.isPending;

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if (isEdit) {
            updateMeeting.mutate({ ...values, id: initialValues.id });
        } else {
            createMeeting.mutate(values);
        }
    };

    const handleContinue = () => {
        if (createdMeetingId) {
            onSuccess?.(createdMeetingId);
        }
    };

    // If we just created a meeting, show the join link
    if (createdMeetingId) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-medium">Meeting Created Successfully!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Share this link with others to allow them to join the meeting
                    </p>
                </div>
                
                <MeetingJoinLink meetingId={createdMeetingId} />
                
                <div className="flex justify-end">
                    <Button onClick={handleContinue}>
                        Continue to Meeting
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>  
            <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog}/>
            <Form {...form}>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel> Name </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="e.g. smtg meeting"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="agentId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel> Agent </FormLabel>
                                <FormControl>
                                    <CommandSelect
                                        options={(agents.data?.items ?? []).map(
                                            (agent) => ({
                                                id: agent.id,
                                                value: agent.id,
                                                children: (
                                                    <div className="flex items-center gap-x-2">
                                                        <GeneratedAvatar
                                                            seed={agent.name}
                                                            variant="botttsNeutral"
                                                            className="border size-6"
                                                        />
                                                        <span>
                                                            {agent.name}
                                                        </span>
                                                    </div>
                                                ),
                                            })
                                        )}
                                        onSelect={field.onChange}
                                        onSearch={setAgentSearch}
                                        value={field.value}
                                        placeholder="Select an agent"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Not found what you&apos;re looking for?{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenNewAgentDialog(true)
                                        }
                                        className="text-primary hover:underline"
                                    >
                                        Create new agent
                                    </button>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between gap-x-2">
                        {onCancel && (
                            <Button
                                variant="ghost"
                                disabled={isPending}
                                type="button"
                                onClick={() => onCancel()}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button disabled={isPending} type="submit">
                            {isEdit ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
};