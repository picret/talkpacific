import useService from "../base/useService";
import { LanguageCoach, LanguageCoachOptions, LanguageCoachState } from "./LanguageCoach";

const useLanguageCoachOptions = (languageCoach: LanguageCoach) => {
  const { options } = useService(
    languageCoach,
    new LanguageCoachOptions(),
    new LanguageCoachState(),
  );
  const languageCoachOptions = options as LanguageCoachOptions;
  return { languageCoachOptions };
}

export default useLanguageCoachOptions;
