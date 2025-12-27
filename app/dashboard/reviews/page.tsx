"use client";

import {ExternalLink, Clock, CheckCircle2, XCircle, GitPullRequest} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {getReviews} from "@/module/review/actions";
import {formatDistanceToNow} from "date-fns";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";

 const ReviewPage = () => {

    const {data : reviews, isLoading} = useQuery({
        queryKey:['reviews'],
        queryFn: async () => {
            return await getReviews();
        }
    })

     if(isLoading){
         return (
             <div className="flex flex-col items-center justify-center min-h-[400px]">
                 <Spinner className="size-6"/>
                 Loading reviews...
             </div>
         )
     }

     return (
         <div className="space-y-4">
             {reviews?.length === 0 ? (
                 /* Empty State */
                 <Card className="border-dashed">
                     <CardContent className="py-16 text-center space-y-3">
                         <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center">
                             <GitPullRequest className="size-5 text-muted-foreground" />
                         </div>
                         <p className="text-sm font-medium">
                             No reviews yet
                         </p>
                         <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                             Connect a repository and open a pull request to generate your first AI review.
                         </p>
                     </CardContent>
                 </Card>
             ) : (
                 /* Reviews List */
                 <div className="grid gap-3">
                     {reviews?.map((review: any) => (
                         <Card
                             key={review.id}
                             className="group border hover:bg-muted/30 transition-colors"
                         >
                             <CardHeader className="pb-3">
                                 <div className="flex items-start justify-between gap-4">
                                     <div className="space-y-1 min-w-0">
                                         <div className="flex items-center gap-2 flex-wrap">
                                             <CardTitle className="text-base font-medium truncate">
                                                 {review.prTitle}
                                             </CardTitle>

                                             {/* Status Badge */}
                                             {review.status === "Completed" && (
                                                 <Badge className="gap-1 bg-emerald-500/10 text-emerald-600">
                                                     <CheckCircle2 className="h-3 w-3" />
                                                     Completed
                                                 </Badge>
                                             )}
                                             {review.status === "Failed" && (
                                                 <Badge className="gap-1 bg-red-500/10 text-red-600">
                                                     <XCircle className="h-3 w-3" />
                                                     Failed
                                                 </Badge>
                                             )}
                                             {review.status === "Pending" && (
                                                 <Badge className="gap-1 bg-yellow-500/10 text-yellow-600">
                                                     <Clock className="h-3 w-3" />
                                                     Pending
                                                 </Badge>
                                             )}
                                         </div>

                                         <CardDescription className="text-xs">
                                             {review.repository.fullName} · PR #{review.prNumber}
                                         </CardDescription>
                                     </div>

                                     {/* GitHub Link */}
                                     <Button
                                         variant="ghost"
                                         size="icon"
                                         className="opacity-0 group-hover:opacity-100 transition-opacity"
                                         asChild
                                     >
                                         <a
                                             href={review.prUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                         >
                                             <ExternalLink className="h-4 w-4" />
                                         </a>
                                     </Button>
                                 </div>
                             </CardHeader>

                             <CardContent className="pt-0 space-y-4">
                                 {/* Time */}
                                 <p className="text-xs text-muted-foreground">
                                     {formatDistanceToNow(new Date(review.createAt), {
                                         addSuffix: true,
                                     })}
                                 </p>

                                 {/* Review Preview */}
                                 <div className="rounded-md border bg-muted/50 p-4">
                            <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                                {review.review.substring(0, 280)}…
                            </pre>
                                 </div>

                                 {/* Action */}
                                 <Button
                                     variant="link"
                                     size="sm"
                                     className="px-0"
                                     asChild
                                 >
                                     <a
                                         href={review.prUrl}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                     >
                                         View full review →
                                     </a>
                                 </Button>
                             </CardContent>
                         </Card>
                     ))}
                 </div>
             )}
         </div>

     )
}

export default ReviewPage;

