import React, {useEffect, useRef, useState} from 'react'

import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

import '../styles/Dashboard.css'
import '../styles/Navbar.css'
import '../styles/Tickets.css'

import { useDispatch, useSelector } from 'react-redux';
import { filterTickets } from '../redux/actions/tickets'
import moment from 'moment'
import { DownloadTableExcel } from 'react-export-table-to-excel';
import Spinner from 'react-bootstrap/Spinner';
import ReactPaginate from 'react-paginate';
import axios from 'axios'
import { URL } from '../components/url'
import { loadUser } from '../redux/actions/auth'



function Tickets() {
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(false)
    const [sideBarOpen, setSideBarOpen] = useState(true)
    const [mobileNum, setMobileNum] = useState(null)
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [status, setStatus] = useState(null)
    const [totalTickets, setTotalTickets] = useState(null)
    const [pageSize, setPageSize] = useState(50)
    const [showAll, setShowAll] = useState(false)

    const tableRef = useRef(null)

    let headers = [
        'Farmer Name',
        'MobileNo',
        'BatchName',
        'attempts',
        'Ticket_Created_At',
        'TicketNumber',
        'State',
        'Pincode',
        'District',
        'Tehsil',
        'Village',
        'OtherDistrict',
        'OtherTehsil',
        'OtherVillage',
        'Product_1',
        'Product_2',
        'Product_3',
        'Crop_1',
        'Crop_2',
        'Crop_3',
        'Sale_S1',
        'Sale_S2',
        'Sale_S3',
        'ECN',
        'Data_Source',
        'QueryRaised',
        'CallType',
        'CallSource',
        'CallRelated',
        'Solution',
        'AcreAge1',
        'AcreAge2',
        'AcreAge3',
        'Department',
        'Status',
        'Remarks',
        'Updated_At',
        'Connect_Status',
        'For Crop',
        'For Product',
        'Agent'
    ]

    let headers1 = [
        'TicketId',
        'Farmer Name',
        'Mobile No',
        'Reg Date',
        'Remarks',
        'Status',
        'Assigned To',
        'Agent'
    ]

    let ticketList = useSelector(state => state.filteredTickets)
    let user = useSelector(state => state.auth.user)

    const handleSubmit = (ev) => {
        ev.preventDefault()
        setIsLoading(true)
        setShowAll(false)
        setPageSize(50)
        let postData = {
            mobileNo:mobileNum,
            startDate,
            endDate,
            status,
            page:1
        }
        dispatch(filterTickets(postData))
        getTicketCount()
    }

    const getTicketCount = async() => {
        let postData = {
            mobileNo:mobileNum,
            startDate,
            endDate,
            status,
            page:1
        }
        const config = {
            headers: {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            }
        }

        const body = JSON.stringify(postData)
        let res = await axios.post(`${URL}/ticket/get/count`, body, config)
        setTotalTickets(res.data.data)
    }

    const handlePageClick = (data) => {
        // console.log(data)
        setIsLoading(true)
        const page = data.selected + 1
        let postData = {
            mobileNo:mobileNum,
            startDate,
            endDate,
            status,
            page:page
        }
        dispatch(filterTickets(postData))
    }

    const showAllData = async(ev) => {
        ev.preventDefault()
        let postData
        setIsLoading(true)
        setShowAll(true)
        // if(showAll){
            setPageSize(5000)
            postData = {
                mobileNo:mobileNum,
                startDate,
                endDate,
                status,
                noPage:true
            }
        // }else{
        //     setPageSize(50)
        //     postData = {
        //         mobileNo:mobileNum,
        //         startDate,
        //         endDate,
        //         status,
        //         page:1
        //     }
        // }
        dispatch(filterTickets(postData))
    }

    useEffect(() => {
        dispatch(loadUser())
      }, [])

    useEffect(() => {
    //   console.log('ticketList',ticketList)
    if(ticketList.length >= 0){
        setIsLoading(false)
    }
    }, [totalTickets, ticketList])

   

    

  return (
    <div className='dashboardContainer'>
        <Navbar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
            <div className='mainBody'>
                <div className='dashboardBodyWrapper'>
                {sideBarOpen ? <Sidebar class={'sidebarMain open'} /> : <Sidebar class={'sidebarMain close'} />}
                    {user.designation !== 'Admin' ? <div><h1>Unauthorized</h1></div> :
                    <div className='dashboardFormContainer'>
                        <div className='mainPageBody'>
                            <div className='pageWrapper'>
                                <div className='filterContainer'>
                                    <form id="form">
                                        <div class="row">
                                            <div className="col-md-2">
                                                <label>Mobile No</label>
                                                <input type="text" class="form-control" id="mobile" name="mobile" onChange={(e)=>setMobileNum(e.target.value)}/>
                                            </div>
                                            <div className="col-md-2">
                                                <label>Start Date</label>
                                                <input type="date" class="form-control" id="start_date" name="start_date" onChange={(e)=>setStartDate(e.target.value)}/>
                                            </div>
                                            <div className="col-md-2">
                                                <label>End Date</label>
                                                <input type="date" class="form-control" id="end_date" name="end_date" onChange={(e)=>setEndDate(e.target.value)}/>
                                            </div>
                                            <div className="col-md-2">
                                                <label>Status</label>
                                                <select type="text" class="form-control" id="status" name="status" onChange={(e) => setStatus(e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option value="open">Open</option>
                                                    <option value="close">Closed</option>
                                                    <option value="na">NA</option>
                                                </select>
                                                {isLoading && <Spinner animation="border" />}
                                            </div>
                                            <div className="col-md-3 mt-4">
                                                <input type="button" class="btn btn-primary" id="search" name="submit" value="Search" onClick={handleSubmit}/>
                                            </div>
                                            <div className='tableContainerExcel'>
                                                <table id="farmer-table" ref={tableRef}>
                                                    <thead className='tableHead'>
                                                        <tr className='tableRow'>
                                                            {
                                                                headers.map((header) => (
                                                                    <td>{header}</td>
                                                                ))
                                                            }
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ticketList.length>0 && ticketList.map((item, index) => (
                                                            <tr className='tableRow' key={index}>
                                                                <td>{item.FarmerName}</td>
                                                                <td>{item.MobileNo}</td>
                                                                <td>{item.BatchName}</td>
                                                                <td>{item.attempts}</td>                                
                                                                <td>{moment(item.Ticket_Created_At).format('DD/MM/YYYY')}</td>
                                                                <td>{item.TicketNumber}</td>
                                                                <td>{item.State}</td>
                                                                <td>{item.Pincode}</td>
                                                                <td>{item.District}</td>
                                                                <td>{item.Tehsil}</td>
                                                                <td>{item.Village}</td>
                                                                <td>{item.OtherDistrict}</td>
                                                                <td>{item.OtherTehsil}</td>
                                                                <td>{item.OtherVillage}</td>
                                                                <td>{item.Product_1}</td>
                                                                <td>{item.Product_2}</td>
                                                                <td>{item.Product_3}</td>                                                        
                                                                <td>{item.Crop_1}</td>
                                                                <td>{item.Crop_2}</td>
                                                                <td>{item.Crop_3}</td>
                                                                <td>{item.Sale_S1}</td>
                                                                <td>{item.Sale_S2}</td>
                                                                <td>{item.Sale_S3}</td>
                                                                <td>{item.ECN}</td>
                                                                <td>{item.Data_Source}</td>
                                                                <td>{item.QueryRaised}</td>
                                                                <td>{item.CallType}</td>
                                                                <td>{item.CallSource}</td>
                                                                <td>{item.CallRelated}</td>
                                                                <td>{item.Solution}</td>
                                                                <td>{item.AcreAge1}</td>
                                                                <td>{item.AcreAge2}</td>
                                                                <td>{item.AcreAge3}</td>
                                                                <td>{item.Department}</td>
                                                                <td>{item.Status}</td>
                                                                <td>{item.Remarks}</td>
                                                                <td>{item.Updated_At}</td>
                                                                <td>{item.Connect_Status}</td>                                                                
                                                                <td>{item.ForCrop}</td>                                                                
                                                                <td>{item.ForProduct}</td>                                                                
                                                                {item.Agent && <td>{item.Agent}</td>}                                                              
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {ticketList.length > 0 ? 
                                            (<div className='tableVisibleContainer'>
                                                <table>
                                                    <thead className='tableHead'>
                                                        <tr className='tableRow'>
                                                            {
                                                                headers1.map((header) => (
                                                                    <td className='tableD'>{header}</td>
                                                                ))
                                                            }
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ticketList.map((item, index) => (
                                                            <tr className='tableRow' key={index}>
                                                                <td className='tableD'>{item.TicketNumber}</td>
                                                                <td className='tableD'>{item.FarmerName}</td>
                                                                <td className='tableD'>{item.MobileNo}</td>
                                                                <td className='tableD'>{moment(item.Ticket_Created_At).format('DD/MM/YYYY')}</td>
                                                                <td className='tableD'>{item.Remarks}</td>
                                                                <td className='tableD'>{item.Status}</td>
                                                                <td className='tableD'>{item.Department}</td> 
                                                                {item.Agent && <td className='tableD'>{item.Agent}</td>}                                                                    
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>) : (!isLoading ? <div>No Data to display</div>: null)}
                                            <div className="buttonsContainer">
                                                <div className='excelButton'>
                                                    <DownloadTableExcel
                                                        currentTableRef={tableRef.current}
                                                        filename="ticketDetail"
                                                        sheet="Sheet"
                                                    ><button onClick={(e) => e.preventDefault()}> Download excel </button>
                                                    </DownloadTableExcel>
                                                </div>
                                                <div className='showAllButton'>
                                                   {ticketList.length > 0 && (<button onClick={(e) => showAllData(e)}>Show All Data</button>)}
                                                </div>
                                                {isLoading && ticketList.length > 0 && <Spinner animation="border" />}
                                            </div>
                                            
                                            <div className="paginationContainer">
                                                <ReactPaginate 
                                                previousLabel={'<'}
                                                nextLabel={'>'}
                                                breakLabel={'...'}
                                                pageCount={ticketList.length > 0 && totalTickets && Math.ceil(totalTickets/pageSize)}
                                                marginPagesDisplayed={1}
                                                pageRangeDisplayed={10}
                                                onPageChange={handlePageClick}
                                                containerClassName={'pagination'}
                                                pageClassName={'page-class'}
                                                pageLinkClassName={'page-link'}
                                                previousClassName={'previous-page-class'}
                                                nextClassName={'next-page-class'}
                                                breakClassName={'break-class'}
                                                breakLinkClassName={'page-link'}
                                                activeClassName={'pageActive'}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </div>
    </div>
  )
}

export default Tickets