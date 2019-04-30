import React, { Component, PropTypes } from 'react'
import provide from 'react-redux-provide'
//import classNames from 'classnames'
import Autosuggest from 'react-autosuggest'
import {pages, setHandler} from '/Users/laliacann/fv-web-ui/frontend/app/assets/javascripts/views/components/SetupArchive/pages.js'
//import pageMain from '/Users/laliacann/fv-web-ui/frontend/app/assets/javascripts/views/components/SetupArchive/pages.js'
import {SubmitButton, Buttons, Title, Intro, ArchiveButton, CancelButton, Steps, Checklist, DropDown, EnterText} from '/Users/laliacann/fv-web-ui/frontend/app/assets/javascripts/views/components/SetupArchive/components.js'

@provide
export default class ArchiveCreator extends Component { 
    static propTypes = {
      properties: PropTypes.object.isRequired,
      routeParams: PropTypes.object.isRequired,
      fetchPortal: PropTypes.func.isRequired,
      computePortal: PropTypes.object.isRequired,
    };

    constructor(props, context) {
      super(props, context)
    }

    render() {
      return <Page />
    }
}

class Page extends Component {

  constructor(props, context) {
    super(props, context)
    this.toNextPage = this.toNextPage.bind(this)
    this.toPrevPage = this.toPrevPage.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {page: pages[0], dialect:'', community:'',archiveName:'', languageGuessAnswer:'', 
    language:'', languageOther: '',familyGuessAnswer:'', family:'', familyOther:'', logo:'', country:'', countryOther:'', 
    region:'', regionOther:'', alphabetGuessAnswer:'',alphabet:'', keyboard:'', keyboardGuide:'',
    langAdminAskAnswer:'', langAdmin:'', created:''}
  }

  toPrevPage() {
    let prevPage = this.state.page
    for (let i = pages.indexOf(prevPage) - 1;i >= 0;i--) {
      if (pages[i].enabled) {
      prevPage = pages[i]
      break
      }
    }
    this.setState({
      page: prevPage,
    })
  }

  toNextPage() {
    let nextPage = this.state.page
    for (let i = pages.indexOf(nextPage) + 1;i >= 0;i++) {
      if (pages[i].enabled) {
      nextPage = pages[i]
      break
      }
    }
    this.setState({
      page: nextPage
    })
  }

  handleChange(e){
    const target = e.target;
    var name= target.getAttribute('name')
    this.setState({ [name]:target.value})

    if(!name.endsWith('Other')){
      if(target.value == 'other'){
        if('c1name' in this.state.page.components){
          this.state.page.components[name+'Other'] = true
        }
        else{
          this.state.page.components['other'] = true
        }
      }
      else {
        if('c1name' in this.state.page.components){
          this.state.page.components[name+'Other'] = false
        }
        else{
          if(this.state.page.components.other){
            this.state.page.components.other = false
          }
        }
      }
    }
    
    if(name.endsWith('Answer')){
      if(name == 'langAdminAskAnswer'){
        pages[pages.indexOf(this.state.page)+1].enabled = target.value.startsWith('Yes')? true:false
        pages[pages.indexOf(this.state.page)+2].enabled = !pages[pages.indexOf(this.state.page)+1].enabled
      }
      else{
        pages[pages.indexOf(this.state.page)+1].enabled = target.value.startsWith('Yes')? false:true
      } 
    }
  }

  handleSubmit(e){
    e.preventDefault()
  }

  handleCancel(e){
    e.preventDefault()
    var cancelled = confirm("If you cancel now. All the information you have entered will be lost. Press Ok to leave the archive creator. Press Cancel to return and create your archive")
  }

  handleArchive(e){
    e.preventDefault()
  }

  getPageMain(pageName, pageProps){
    console.log(this.state)
    console.log(pageName)
    console.log(pageProps)
    var nameToPage = {
      start: '',
      steps:<StepsPg steps={pageProps.steps}/>, 
      checklist: <ChecklistPg steps={pageProps.steps}/>, 
      names:<NamesPg value1={this.state[pageProps.c1name]} value2={this.state[pageProps.c2name]} value3={this.state[pageProps.c3name]} name1={pageProps.c1name} name2={pageProps.c2name} name3={pageProps.c3name} title1={pageProps.c1title} title2={pageProps.c2title} title3={pageProps.c3title} subtitle1={pageProps.c1subtitle} subtitle2={pageProps.c2subtitle} subtitle3={pageProps.c3subtitle} handleChange={this.handleChange}/>, 
      languageGuess: <DropDownPg value={this.state[pageProps.name]} name={pageProps.name} title={pageProps.title} subtitle={pageProps.subtitle} options={pageProps.options} handleChange={this.handleChange}/>, 
      languagePick:<DropDownPg value={this.state[pageProps.name]} valueOther={this.state[pageProps.name+'Other']} name={pageProps.name} title={pageProps.title} options={pageProps.options} other={pageProps.other} handleChange={this.handleChange}/>, 
      familyGuess:<DropDownPg value={this.state[pageProps.name]} name={pageProps.name} title={pageProps.title} subtitle={pageProps.subtitle} options={pageProps.options} handleChange={this.handleChange}/>, 
      familyPick:<DropDownPg value={this.state[pageProps.name]} valueOther={this.state[pageProps.name+'Other']} name={pageProps.name} title={pageProps.title} options={pageProps.options} other={pageProps.other} handleChange={this.handleChange}/>, 
      logo:<EnterPg name={pageProps.name} type={pageProps.type} title={pageProps.title} value={this.state[pageProps.name]} handleChange={this.handleChange}/>, 
      dialectInfo:<MultiDropDownPg value1={this.state[pageProps.c1name]} valueOther1={this.state[pageProps.c1name+'Other']} valueOther2={this.state[pageProps.c2name+'Other']} value2={this.state[pageProps.c2name]} name1={pageProps.c1name} name2={pageProps.c2name} title1={pageProps.c1title} title2={pageProps.c2title} options1={pageProps.c1options} options2={pageProps.c2options} other1={pageProps.countryOther} other2={pageProps.regionOther} handleChange={this.handleChange} />, 
      alphabetGuess:<DropDownPg value={this.state[pageProps.name]} name={pageProps.name} title={pageProps.title} options={pageProps.options} handleChange={this.handleChange}/>, 
      alphabetPick:<DropDownPg value={this.state[pageProps.name]} name={pageProps.name} title={pageProps.title} options={pageProps.options} other={pageProps.other} handleChange={this.handleChange}/>, 
      keyboards:<MultiDropDownPg value1={this.state[pageProps.c1name]} value2={this.state[pageProps.c2name]} name1={pageProps.c1name} name2={pageProps.c2name} title1={pageProps.c1title} title2={pageProps.c2title} options1={pageProps.c1options} options2={pageProps.c2options} handleChange={this.handleChange} />, 
      langAdminAsk:<DropDownPg value={this.state[pageProps.name]} name={pageProps.name} title={pageProps.title} options={pageProps.options} handleChange={this.handleChange}/>, 
      langAdminInput:<EnterPg name={pageProps.name} type={pageProps.type} multiple={pageProps.multiple} value={this.state[pageProps.name]} title={pageProps.title} handleChange={this.handleChange}/>, 
      langAdminRegister:<LangAdminRegisterPg/>, 
      creation: <CreationPg handleSubmit={this.handleSubmit} handleCancel={this.handleCancel}/>, 
      nextSteps:<NextStepsPg steps={pageProps.steps} handleArchive={this.handleArchive}/>, 
      editPortal:<StepsPg steps={pageProps.steps}/>, 
      firstWord:<StepsPg steps={pageProps.steps}/>, 
      batchUpload: '',
      done:<DonePg handleArchive={this.handleArchive}/>
    }

    
    return nameToPage[pageName]
  }

  render() {
    const page = this.state.page
    var required = page.required? checkRequired(page.required, this.state):false
    var main = this.getPageMain(page.name, page.components)
    return (
      <div style={{minHeight: '68vh', position:'relative'}}>
        <div className="row" style={{ marginTop: '25px' }} />
        <div className="col-xs-12" style={{marginBottom: '15px'}}/>
        <Title name={page.title}/>
        <Intro text={page.intro}/>
        <div>
          {main}
        </div>
        <Buttons
          required={required}
          start={page === pages[0]}
          end={page === pages[pages.length - 1]}
          onBackClick={this.toPrevPage}
          onNextClick={this.toNextPage}
        />
      </div>

    )
  }
}

function checkRequired(req, currentVals){
  if (!currentVals[req].trim()){
    return true
  }
  else if(currentVals[req] == 'other'){
    if(!currentVals[req+'Other'].trim()){
      return true
    }
    return false
  }
  return false
}

function StepsPg(props) {
  return <Steps steps={props.steps} />;
}

function ChecklistPg(props){ 
  return <Checklist steps={props.steps}/>;
}

function NamesPg(props) {
  return (
    <div>
      <EnterText value={props.value1} name={props.name1} title={props.title1} subtitle={props.subtitle1} handleChange={props.handleChange}/>
      <div style={{marginTop:'20px'}}/>
      <EnterText value={props.value2} name={props.name2} title={props.title2} subtitle={props.subtitle2} handleChange={props.handleChange}/>
      <div style={{marginTop:'20px'}}/>
      <EnterText value={props.value3} name={props.name3} title={props.title3} subtitle={props.subtitle3} handleChange={props.handleChange} />
    </div>
  );
}

function DropDownPg(props){
  return <DropDown value={props.value} valueOther={props.valueOther} name={props.name} title={props.title} subtitle={props.subtitle} options={props.options} handleChange={props.handleChange} other={props.other}/>;
}

function EnterPg(props){
  console.log(props.value)
  return <EnterText value={props.value} name={props.name} type={props.type} multiple={props.multiple} title={props.title} handleChange={props.handleChange}/>
}

function MultiDropDownPg(props){
  return (
    <div>
      <DropDown value={props.value1} valueOther={props.valueOther1} name={props.name1} title={props.title1} options={props.options1} handleChange={props.handleChange} other={props.other1}/>
      <div style={{marginTop:'20px'}}/>
      <DropDown value={props.value2} valueOther={props.valueOther2} name={props.name2} title={props.title2} options={props.options2} handleChange={props.handleChange} other={props.other2}/>
    </div>
  );
}
//multi select option

function LangAdminRegisterPg(props) {
  return <div>embed registration page here</div>;
}

function CreationPg(props){
  return (
    <div>
      <p>Create Archive: Your archive will be created privately so that only you can see it. You will be able to now enter and edit your archive. It will remain active for 30 days and then will be removed from FirstVoices. If you would like to keep your archive longer than this or have others be able to access your archive please contact FirstVoices at support@fpcc.ca</p>
      <p>Cancel: Your archive will not be created and the information you have entered so far will be permanently lost</p>
      <SubmitButton onSubmit={props.handleSubmit}/>
      <CancelButton onCancel={props.handleCancel}/>
    </div>
    )
}

function NextStepsPg(props) {
  return(
    <div>
      <Checklist steps={props.steps}/>
      <p>If you feel confident using FirstVoices already, feel free to begin working on your archive now.</p>
      <ArchiveButton goToArchive={props.handleArchive}/>
    </div>
  );
}

function DonePg(props){
  return(
    <div>
      <p>We hope this demo has been useful. If you have any further questions you can contact us at support@fpcc.ca.</p>
      <p>Your archive will be available for 30 days. If you wish to keep your archive longer than this or delete it sooner please contact us. If you have any further questions you can contact us at support@fpcc.ca.</p>
      <ArchiveButton goToArchive={props.handleArchive}/>
    </div>
  );
}

/*
<DropDown options={['one', 'two', 'three']} title="choose one" form="create-archive" />
<EnterText title="Enter dialect:" form="create-archive" />
<EnterFile title="Upload image:" form="create-archive" />
<Checklist steps={['first', 'second', 'third', 'fourth']}/>
<SubmitButton form="create-archive"/>
<Steps steps={['a', 'b', 'c a longger sentence ccccccc vvvvvvvv ddddddddd', 'd']}></Steps>
<EnterText title="Enter dialect:" subtitle='this is very important' form="create-archive" />
*/
