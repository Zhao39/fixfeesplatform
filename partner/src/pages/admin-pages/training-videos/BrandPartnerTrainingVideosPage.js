import { TRAINING_TYPE } from "config/constants";
import TrainingVideosPageContainer from "./TrainingVideosPageContainer";

const BrandPartnerTrainingVideosPage = (props) => {

  return (
    <TrainingVideosPageContainer pageTitle="Brand Partner Trainings" trainingType={TRAINING_TYPE.BRAND_PARTNER}>

    </TrainingVideosPageContainer>
  )
}

export default BrandPartnerTrainingVideosPage;