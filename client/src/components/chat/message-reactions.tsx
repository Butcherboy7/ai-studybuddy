import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import type { Message as StoreMessage } from '@/store/appStore';

interface MessageReactionsProps {
  message: StoreMessage;
}

const EMOJI_REACTIONS = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '🤔', '💡', '🎉', '👏'
];

export function MessageReactions({ message }: MessageReactionsProps) {
  const { sessionId } = useAppStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const addReactionMutation = useMutation({
    mutationFn: async (reaction: string) => {
      const response = await apiRequest("POST", `/api/messages/${message.id}/reactions`, {
        reaction
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId, 'messages'] });
      setIsOpen(false);
    },
    onError: (error) => {
      console.error("Add reaction error:", error);
      toast({
        title: "Failed to add reaction",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  });

  const removeReactionMutation = useMutation({
    mutationFn: async (reaction: string) => {
      const response = await apiRequest("DELETE", `/api/messages/${message.id}/reactions`, {
        reaction
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId, 'messages'] });
    },
    onError: (error) => {
      console.error("Remove reaction error:", error);
      toast({
        title: "Failed to remove reaction",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleReactionClick = (reaction: string) => {
    const reactions = message.reactions || [];
    if (reactions.includes(reaction)) {
      removeReactionMutation.mutate(reaction);
    } else {
      addReactionMutation.mutate(reaction);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    addReactionMutation.mutate(emoji);
  };

  const reactions = message.reactions || [];
  const uniqueReactions = [...new Set(reactions)];

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Display existing reactions */}
      {uniqueReactions.map((reaction) => {
        const count = reactions.filter(r => r === reaction).length;
        return (
          <Button
            key={reaction}
            variant="ghost"
            size="sm"
            onClick={() => handleReactionClick(reaction)}
            className="h-6 px-2 py-1 text-xs bg-muted/50 hover:bg-muted border border-border rounded-full"
            disabled={addReactionMutation.isPending || removeReactionMutation.isPending}
          >
            <span className="mr-1">{reaction}</span>
            {count > 1 && <span className="text-muted-foreground">{count}</span>}
          </Button>
        );
      })}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground rounded-full border border-dashed border-border hover:border-solid"
            title="Add reaction"
          >
            <i className="fas fa-plus text-xs"></i>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-5 gap-1">
            {EMOJI_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiSelect(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-muted rounded"
                disabled={addReactionMutation.isPending}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}