import { useEffect, useRef, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import api from "../../libs/axios";
import { getInstitutionProfileApi } from "../../api-endpoint/sms/smsEndpoints";

export default function StudentAcademicSection({ student }) {
  const id = student?.id || student?._id;
  const institutionId = student?.institutionId;
  const [session, setSession] = useState("");
  const [data, setData] = useState(null);
  const [department, setDepartment] = useState("");
  const [subjectIds, setSubjectIds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const currentScope = useRef("");
  currentScope.current = `${id}|${session}`;
  useEffect(() => {
    let active = true;
    getInstitutionProfileApi().then((result) => {
      if (active) setSession(result.data?.academicSession || "");
    }).catch(() => { if (active) setNotice("Enter the school's academic session to load subject choices."); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setData(null);
    if (!id || !/^\d{4}\/\d{4}$/.test(session)) return;
    setBusy(true);
    api.get(`/student-academics/student/${id}`, { params: { session, institutionId }, withCredentials: true })
      .then(({ data: result }) => {
        if (!active) return;
        if (!result.success) throw new Error(result.message);
        setData(result.data);
        setDepartment(result.data.profile?.department || "");
        setSubjectIds(result.data.profile?.subjectIds || []);
        setNotice("");
      }).catch((error) => { if (active) setNotice(error.response?.data?.message || "Unable to load academic choices"); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [id, session, institutionId]);
  const save = async () => {
    if (!data?.requiresDepartment || busy) return;
    const savedScope = currentScope.current;
    setBusy(true);
    try {
      const { data: result } = await api.put(`/student-academics/student/${id}`, {
        session, department, subjectIds, institutionId,
      }, { withCredentials: true });
      if (!result.success) throw new Error(result.message);
      if (savedScope !== currentScope.current) return;
      setData(result.data);
      setNotice("Academic choices saved. Refresh the report/score sheet to use them.");
    } catch (error) { if (savedScope === currentScope.current) setNotice(error.response?.data?.message || "Academic choices could not be saved"); }
    finally { if (savedScope === currentScope.current) setBusy(false); }
  };
  return <Box borderTop="1px solid #CBD5E1" mt={4} pt={4}>
    <Text fontWeight="bold">Department And Offered Subjects</Text>
    <Text fontSize="sm" mb={2}>Set these separately for each academic session. No department is guessed.</Text>
    <label>Academic session <input aria-label="Academic session" value={session} placeholder="2026/2027" disabled={busy} onChange={(e) => setSession(e.target.value)} style={{ width: "100%", padding: 8, border: "1px solid #CBD5E1" }} /></label>
    {data?.requiresDepartment && <>
      <label>SS department <select aria-label="SS department" value={department} disabled={busy} onChange={(e) => setDepartment(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 8 }}>
        <option value="">Choose department</option>{["Science", "Commercial", "Arts"].map((name) => <option key={name}>{name}</option>)}
      </select></label>
      <Text mt={3} fontSize="sm">Select only the subjects this student offers:</Text>
      <Box maxH="200px" overflowY="auto" py={2}>
        {(data.subjects || []).map((subject) => <label key={subject.id} style={{ display: "block", padding: "6px 0" }}>
          <input type="checkbox" disabled={busy} checked={subjectIds.includes(subject.id)} onChange={(e) => setSubjectIds((ids) => e.target.checked ? [...ids, subject.id] : ids.filter((value) => value !== subject.id))} /> {subject.name}
        </label>)}
      </Box>
      <Button type="button" mt={2} onClick={save} disabled={busy || !department || !subjectIds.length}>Save Academic Choices</Button>
    </>}
    {data && !data.requiresDepartment && <Text mt={2} fontSize="sm">Junior/non-SS classes retain their existing common-subject rules.</Text>}
    {notice && <Text role="status" mt={2} fontSize="sm">{notice}</Text>}
  </Box>;
}
