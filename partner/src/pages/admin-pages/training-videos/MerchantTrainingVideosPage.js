import { TRAINING_TYPE } from "config/constants";
import TrainingVideosPageContainer from "./TrainingVideosPageContainer";

const MerchantTrainingVideosPage = (props) => {

  return (
    <TrainingVideosPageContainer pageTitle="Merchant Processing Trainings" trainingType={TRAINING_TYPE.MERCHANT}>

    </TrainingVideosPageContainer>
  )
}

export default MerchantTrainingVideosPage;