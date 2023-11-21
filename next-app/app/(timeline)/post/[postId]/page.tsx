/** @jsxImportSource @emotion/react */

"use client";

import { css } from "@emotion/react";
import { useEffect, useRef } from "react";
import { HiOutlineUserCircle } from "react-icons/hi";

import {
  FlexColBox,
  FlexColCenteredBox,
  FlexHorBox,
  MarginBox,
} from "@components/elements/box";
import { IndigoSecondaryButton } from "@components/elements/button";
import { ErrorReloading } from "@components/elements/error";
import { StyledTextArea } from "@components/elements/input";
import { Loading } from "@components/elements/loading";
import { PagePaper } from "@components/elements/paper";
import { TextDanger } from "@components/elements/text";
import { CommentItem, PostItem } from "@components/layouts/timeline";
import { MEDIA_QUERIES } from "@styles/utils";

import { usePostComment, usePostTimeline } from "./hook";

export default function Page({ params }: { params: { postId: string } }) {
  const {
    post,
    isFetchingPost,
    isErrorFetchingPost,
    refetchPost,
    commentList,
    isFetchingCommentList,
    isErrorFetchingCommentList,
    refetchInitialCommentList,
  } = usePostTimeline(params.postId);

  const { register, onSubmitComment, isSubmittingComment, errorText } =
    usePostComment(params.postId, refetchPost, refetchInitialCommentList);

  const { ref, onChange, ...rest } = register("texts");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleChangeComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset textarea height
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight * 0.8 + "px"; // Set the height of textarea to its scroll height
    }
  };
  useEffect(() => {
    ref(textareaRef.current);
  }, [ref]);

  return (
    <PagePaper>
      {isFetchingPost ? (
        <Loading text="投稿を読み込み中...." />
      ) : isErrorFetchingPost ? (
        <ErrorReloading
          text="投稿の読み込みに失敗しました"
          onClick={refetchPost}
        />
      ) : (
        <FlexColBox>
          {post ? <PostItem post={post} /> : null}
          <MarginBox marginTopPx={20} isWidthMax={true}>
            {isFetchingCommentList ? (
              <Loading text="コメントを読み込み中...." />
            ) : isErrorFetchingCommentList ? (
              <ErrorReloading
                text="コメントの読み込みに失敗しました"
                onClick={refetchInitialCommentList}
              />
            ) : (
              <FlexColCenteredBox>
                <FlexColBox
                  css={css`
                    width: 100%;
                  `}
                >
                  <FlexHorBox>
                    <HiOutlineUserCircle size={30} />
                    <MarginBox marginLeftPx={10} isWidthMax={true}>
                      <StyledTextArea
                        {...rest}
                        ref={textareaRef}
                        onChange={handleChangeComment}
                        rows={1}
                        placeholder="Let's comment!"
                        css={css`
                          font-size: 18px;
                          overflow-y: hidden; // Hide scrollbars
                        `}
                      />
                    </MarginBox>
                  </FlexHorBox>
                  <FlexHorBox
                    css={css`
                      justify-content: flex-end;
                      ${MEDIA_QUERIES.upTo600} {
                        justify-content: center;
                      }
                    `}
                  >
                    {errorText ? <TextDanger>{errorText}</TextDanger> : null}
                    <MarginBox marginTopPx={10}>
                      {isSubmittingComment ? (
                        <Loading text="コメントを投稿中..." />
                      ) : (
                        <IndigoSecondaryButton onClick={onSubmitComment}>
                          Comment
                        </IndigoSecondaryButton>
                      )}
                    </MarginBox>
                  </FlexHorBox>
                </FlexColBox>
                {commentList?.map((comment, index) => (
                  <MarginBox key={index} marginTopPx={20} isWidthMax={true}>
                    <CommentItem comment={comment} />
                  </MarginBox>
                ))}
              </FlexColCenteredBox>
            )}
          </MarginBox>
        </FlexColBox>
      )}
    </PagePaper>
  );
}
