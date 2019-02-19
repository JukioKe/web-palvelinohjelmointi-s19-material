import React, { Fragment, Component } from "react"
import styled from "styled-components"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencilAlt as icon } from "@fortawesome/free-solid-svg-icons"
import { OutboundLink } from "gatsby-plugin-google-analytics"

import {
  fetchProgrammingExerciseDetails,
  fetchProgrammingExerciseModelSolution,
} from "../../services/moocfi"
import { Button, Paper, Card, CardContent, Divider } from "@material-ui/core"
import Modal from "@material-ui/core/Modal"
import LoginStateContext from "../../contexes/LoginStateContext"
import LoginControls from "../../components/LoginControls"
import withSimpleErrorBoundary from "../../util/withSimpleErrorBoundary"
import { normalizeExerciseId } from "../../util/strings"
import Loading from "../../components/Loading"

const ModalContent = styled(Paper)`
  padding: 5rem;
  overflow-y: scroll;
  max-height: 100vh;
`

const TokenContainer = styled.div`
  margin-bottom: 1rem;
  p {
    font-size: 1rem;
    color: #2e3032;
  }
`

class Coins extends Component {
  state = {
    exerciseDetails: undefined,
    modelSolutionModalOpen: false,
    modelSolution: undefined,
    render: false,
  }

  onShowModelSolution = async () => {
    try {
      let modelSolution = this.state.modelSolution
      if (!modelSolution) {
        modelSolution = await fetchProgrammingExerciseModelSolution(
          this.props.exerciseDetails.id,
        )
      }

      this.setState({ modelSolutionModalOpen: true, modelSolution })
    } catch (err) {
      console.error("Could not fetch model solution", err)
    }
  }

  onModelSolutionModalClose = () => {
    this.setState({ modelSolutionModalOpen: false })
  }

  render() {
    const { exerciseDetails, noCoins } = this.props

    if (noCoins) {
      return (
        <TokenContainer>
          Tässä tehtävässä ei voi käyttää kolikkoa mallivastauksen katsomiseen
          ennen tehtävän ratkaisua.
        </TokenContainer>
      )
    }
    const tokenThreshHold =
      exerciseDetails?.course
        ?.grant_model_solution_token_every_nth_completed_exercise
    //const _totalTokens = exerciseDetails?.course?.total_model_solution_tokens
    const availableTokens =
      exerciseDetails?.course?.available_model_solution_tokens
    const modelSolutionTokenUsedOnThisExercise =
      exerciseDetails?.model_solution_token_used_on_this_exercise
    return (
      <div>
        {tokenThreshHold && (
          <Fragment>
            <TokenContainer>
              <p>
                Joka kerta kun olet saanut <i>{tokenThreshHold}</i> tehtävää
                tehtyä, saat kolikon. Kolikoilla voi ostaa tehtävien vastauksia
                ja lunastaa itsesi mahdollisesta jumista.{" "}
                {availableTokens === 1 ? (
                  <span> Käytössäsi on tällä hetkellä 1 kolikko.</span>
                ) : availableTokens > 0 ? (
                  <span>
                    {" "}
                    Käytössäsi on tällä hetkellä {availableTokens} kolikkoa.
                  </span>
                ) : (
                  <span>Sinulla ei ole vielä yhtään kolikkoa.</span>
                )}
              </p>
              <p>
                Kolikkoja kuluu vain silloin kun painat tämän tekstin
                alapuolella olevaa nappia, jossa lukee "kuluttaa kolikon".
                Pystyt katsomaan mallivastauksen ilman kolikkoja Test My Code
                -palvelusta joko Netbeanssin tai TMC:n nettisivun kautta sen
                jälkeen kun olet saanut tehtävän oikein.
              </p>

              {(availableTokens > 0 ||
                modelSolutionTokenUsedOnThisExercise) && (
                <Button
                  onClick={this.onShowModelSolution}
                  variant="outlined"
                  color="secondary"
                >
                  Katso mallivastaus (
                  {modelSolutionTokenUsedOnThisExercise
                    ? "olet käyttänyt jo kolikon tähän mallivastaukseen"
                    : "kuluttaa kolikon"}
                  )
                </Button>
              )}

              <Button variant="outlined" onClick={this.props.onUpdate}>
                Päivitä
              </Button>
            </TokenContainer>

            <Modal
              open={this.state.modelSolutionModalOpen}
              onClose={this.onModelSolutionModalClose}
            >
              {this.state.modelSolution && (
                <ModalContent>
                  <h1>Mallivastaus</h1>
                  {this.state.modelSolution.solution.files.map(fileEntry => {
                    console.log(fileEntry)
                    return (
                      <Card>
                        <CardContent>
                          <h2>{fileEntry.path}</h2>
                          <pre class="language-java">{fileEntry.contents}</pre>
                        </CardContent>
                      </Card>
                    )
                  })}
                </ModalContent>
              )}
            </Modal>
          </Fragment>
        )}
      </div>
    )
  }
}

export default withSimpleErrorBoundary(Coins)
