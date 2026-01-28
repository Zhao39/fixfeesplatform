import { TRAINING_TYPE } from "config/constants";
import TrainingVideosPageContainer from "./TrainingVideosPageContainer";

const LiveTrainingVideosPage = (props) => {

  return (
    <TrainingVideosPageContainer pageTitle="Live Trainings Vault" trainingType={TRAINING_TYPE.LIVE}>

    </TrainingVideosPageContainer>
  )
}

export default LiveTrainingVideosPage;