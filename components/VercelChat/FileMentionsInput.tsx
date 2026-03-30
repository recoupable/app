"use client";

import { useEffect, useState } from "react";
import { MentionsInput, Mention, OnChangeHandlerFunc, SuggestionDataItem } from "react-mentions";
import { Card } from "@/components/ui/card";
import { mentionsStyles } from "./mentionsStyles";
import useFileMentionSuggestions, { GroupedSuggestion } from "@/hooks/useFileMentionSuggestions";
import { useBatchSignedUrls } from "@/hooks/useBatchSignedUrls";
import { SuggestionItem } from "./SuggestionItem";

interface FileMentionsInputProps {
	value: string;
	onChange: (newValue: string) => void;
	disabled: boolean;
	model: string;
}

export default function FileMentionsInput({ value, onChange, disabled, model }: FileMentionsInputProps) {
	const [portalHost, setPortalHost] = useState<Element | undefined>(undefined);
	useEffect(() => {
		if (typeof window !== "undefined") setPortalHost(document.body);
	}, []);

	const handleMentionsChange: OnChangeHandlerFunc = (_event, newValue) => {
		onChange(newValue);
	};

	const { provideSuggestions, lastResults } = useFileMentionSuggestions(value);
    
    // Batch fetch signed URLs using the custom hook
    const signedUrls = useBatchSignedUrls(lastResults as GroupedSuggestion[]);

	return (
		<MentionsInput
			value={typeof value === "string" ? value : ""}
			onChange={handleMentionsChange}
			disabled={disabled}
			className="w-full text-[14px] leading-[1.6] pb-2 md:pb-0 text-foreground [&_textarea]:placeholder:text-muted-foreground"
			suggestionsPortalHost={portalHost}
			allowSuggestionsAboveCursor
			customSuggestionsContainer={(children) => (
				<Card className="z-[70] shadow-lg border border-border rounded-xl overflow-hidden p-1 max-w-32 bg-popover" style={{ minWidth: 320, maxHeight: 360, overflow: "auto" }}>{children}</Card>
			)}
			placeholder={
				model === "fal-ai/nano-banana/edit"
					? "Describe an image or upload a file to edit..."
					: "What would you like to know? Type @ to attach files"
			}
			onKeyDown={(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					const form = (e.target as HTMLTextAreaElement)?.form;
					if (form) form.requestSubmit();
				}
			}}
			style={mentionsStyles}
		>
			<Mention
				trigger="@"
				markup='@[__display__](__id__)'
				data={(query: string, callback: (results: SuggestionDataItem[]) => void) => provideSuggestions(query, callback)}
				displayTransform={(_id: string, display: string) => display}
				appendSpaceOnAdd
				style={{
                    // Highlight color for the mentioned file (pill effect)
                    // Using rgba instead of hsl(var(--primary)) because react-mentions doesn't support nested CSS variables properly here
                    backgroundColor: "rgba(59, 130, 246, 0.15)", // blue-500 at 15%
                    borderRadius: "2px",
				}}
				renderSuggestion={(
					entry: SuggestionDataItem,
					_search: string,
					highlightedDisplay: React.ReactNode,
					index: number,
					focused: boolean
				) => {
					const current = lastResults[index] as GroupedSuggestion | undefined;
					const prev = index > 0 ? (lastResults[index - 1] as GroupedSuggestion | undefined) : undefined;
					const showHeader = !prev || (current && prev && current.group !== prev.group);
                    
                    // Pass the pre-loaded URL if available
                    const url = current?.storage_key ? signedUrls[current.storage_key] : undefined;

					return (
						<div key={entry.id}>
							{showHeader && current && (
								<div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
									{current.group}
								</div>
							)}
                            {current && (
                                <SuggestionItem 
                                    entry={current} 
                                    focused={focused} 
                                    highlightedDisplay={highlightedDisplay} 
                                    imageUrl={url}
                                />
                            )}
						</div>
					);
				}}
			/>
		</MentionsInput>
	);
}
