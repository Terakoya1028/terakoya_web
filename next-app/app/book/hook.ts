import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
// https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#userouter-hook

import {
  usePostBooking,
  RequestBody,
  COURSE_CHOICE,
  STUDY_STYLE,
  HOW_TO_KNOW_TERAKOYA,
  TERAKOYA_TYPE,
  TERAKOYA_EXPERIENCE,
} from "@apis/(booking)/book";
import { useFetchExcludedDates } from "@apis/(booking)/excluded-dates";
import {
  TODAY_JST,
  getNextSameDayDateList,
  getNextTargetDayDate,
} from "@utils/datetime";

export const useBook = () => {
  // https://legacy.react-hook-form.com/api/useform/
  const { register, handleSubmit, setValue, getValues, resetField } = useForm<
    // Control the value of the form fields as string in useForm because setValue() does not work for number type in Safari
    Omit<RequestBody, "terakoya_type" | "terakoya_experience"> & {
      terakoya_type: string;
      terakoya_experience: string;
    }
  >({
    // Should avoid providing undefined as a default value as long as possible
    // https://www.react-hook-form.com/api/useform/#defaultValues
    defaultValues: {
      name: "",
      email: "",
      attendance_date_list: [],
      study_subject_detail: "",
      study_style: STUDY_STYLE.NULL,
      school_name: "",
      first_choice_school: "",
      course_choice: COURSE_CHOICE.NULL,
      future_free: "",
      like_thing_free: "",
      how_to_know_terakoya: HOW_TO_KNOW_TERAKOYA.NULL,
      remarks: "",
    },
  });

  const router = useRouter();
  const { mutate: book, isLoading } = usePostBooking();

  const onSubmit = handleSubmit((inputs) => {
    // console.log(`Request Body:\n${JSON.stringify(inputs)}`);
    if (inputs.attendance_date_list.length === 0) {
      toast.error("参加希望日を1つ以上選択して下さい");
      return;
    }
    const requestBody = {
      ...inputs,
      terakoya_type: Number(selectedTerakoyaType) as TERAKOYA_TYPE,
      terakoya_experience: Number(
        selectedTerakoyaExperience
      ) as TERAKOYA_EXPERIENCE,
    };

    // options (ex: onSuccess, onError) in mutate() will be fired every time mutate() is called and before the same options in useMutation() are fired.
    // On the other hand, onSuccess, onError in useMutation() are fired by default only when options in mutate() are not defined.
    // https://tanstack.com/query/v4/docs/react/guides/mutations#consecutive-mutations
    book(requestBody, {
      onSuccess: () => {
        router.push("/success");
      },
      onError: () => {
        router.push("/error");
      },
    });
  });

  const onChangeDateList = (value: string) => {
    const selectedDateList = getValues().attendance_date_list;
    if (selectedDateList.includes(value)) {
      setValue(
        "attendance_date_list",
        selectedDateList.filter((dt) => dt != value)
      );
      return;
    }
    setValue("attendance_date_list", [...selectedDateList, value]);
  };

  const [selectedTerakoyaExperience, setTerakoyaExperience] =
    useState<string>();
  const onChangeSelectedExperience = (value: string) => {
    setTerakoyaExperience(value);
  };

  const [selectedTerakoyaType, setTerakoyaType] = useState<string>();
  const onChangeSelectedTerakoyaType = (value: string) => {
    setTerakoyaType(value);
    _reset();
  };
  const _reset = () => {
    resetField("attendance_date_list");
    resetField("grade");
    // resetField("study_subject");
  };

  const { data, isLoading: isLoadingExDates } = useFetchExcludedDates({
    onError: () => toast.error("予約不能日の取得に失敗しました"),
  });
  const TUESUDAY = 2;
  const SATURDAY = 6;
  const TERAKOYA_START_TIME = 17;
  const SHOW_DATES_MAX_COUNT = 3;
  const _getNextThreeDateList = (day: 2 | 6) =>
    getNextSameDayDateList(
      getNextTargetDayDate(TODAY_JST, day, TERAKOYA_START_TIME),
      SHOW_DATES_MAX_COUNT,
      data?.dates
    );

  return {
    register,
    onSubmit,
    isLoading,
    isLoadingExDates,
    onChangeDateList,
    selectedTerakoyaExperience,
    onChangeSelectedExperience,
    selectedTerakoyaType,
    onChangeSelectedTerakoyaType,
    isMiddle:
      selectedTerakoyaType == TERAKOYA_TYPE.MID_IKE.toString() ||
      selectedTerakoyaType == TERAKOYA_TYPE.MID_SHIBU.toString(),
    attendanceDateList: _getNextThreeDateList(
      selectedTerakoyaType == TERAKOYA_TYPE.MID_SHIBU.toString()
        ? SATURDAY
        : TUESUDAY
    ),
  };
};