import { useEffect, useState } from 'react';
import {
    addEducation,
    addExperience,
    deleteEducation,
    deleteExperience,
    getMyProfile,
    getProfileCompletion,
    updateProfile,
    updateResume,
    updateSkills
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function Profile() {
    const { user } = useAuth();
    const isSeeker = user?.role === 'jobseeker';
    const [profile, setProfile] = useState(null);
    const [completion, setCompletion] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', bio: '', skills: '' });
    const [education, setEducation] = useState({ degree: '', institution: '', startYear: '', endYear: '' });
    const [experience, setExperience] = useState({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    const [resumeUrl, setResumeUrl] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyProfile();
            const current = data.profile;
            setProfile(current);
            setForm({
                name: current.name || '',
                email: current.email || '',
                phone: current.phone || '',
                location: current.location || '',
                bio: current.bio || '',
                skills: (current.skills || []).join(', ')
            });
            setResumeUrl(current.resumeUrl || '');
            if (isSeeker) {
                setCompletion(await getProfileCompletion());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [isSeeker]);

    const flash = (text) => {
        setMessage(text);
        setError('');
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            setError('Name and email are required.');
            return;
        }
        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone,
                location: form.location,
                bio: form.bio
            };
            const data = await updateProfile(payload);
            if (isSeeker) {
                await updateSkills(form.skills.split(',').map((skill) => skill.trim()).filter(Boolean));
                setCompletion(await getProfileCompletion());
            }
            setProfile(data.profile);
            flash('Profile updated.');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEducation = async (event) => {
        event.preventDefault();
        if (!education.degree || !education.institution || !education.startYear) {
            setError('Degree, institution, and start year are required.');
            return;
        }
        try {
            await addEducation({
                degree: education.degree,
                institution: education.institution,
                startYear: Number(education.startYear),
                endYear: education.endYear ? Number(education.endYear) : undefined
            });
            setEducation({ degree: '', institution: '', startYear: '', endYear: '' });
            flash('Education added.');
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleExperience = async (event) => {
        event.preventDefault();
        if (!experience.company || !experience.position || !experience.startDate) {
            setError('Company, position, and start date are required.');
            return;
        }
        try {
            await addExperience({
                ...experience,
                isCurrent: Boolean(experience.isCurrent)
            });
            setExperience({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '' });
            flash('Experience added.');
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleResume = async (event) => {
        event.preventDefault();
        try {
            await updateResume(resumeUrl);
            flash('Resume URL saved.');
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="container section"><Loading message="Loading profile..." /></div>;
    if (error && !profile) return <div className="container section"><ErrorMessage message={error} onRetry={load} /></div>;

    return (
        <div className="container section profile-page">
            <h1>My profile</h1>
            {isSeeker && completion && (
                <div className="completion-bar">
                    <p>Profile completion: {completion.completion}%</p>
                    <div className="bar"><span style={{ width: `${completion.completion}%` }} /></div>
                    {completion.missing?.length > 0 && (
                        <p className="muted">Missing: {completion.missing.join(', ')}</p>
                    )}
                </div>
            )}
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form className="form-card" onSubmit={handleProfileSubmit}>
                <h2>Basic information</h2>
                <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
                <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
                <label>Bio<textarea rows="4" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
                {isSeeker && (
                    <label>Skills (comma separated)<input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label>
                )}
                <button type="submit" className="btn btn-primary">Save profile</button>
            </form>

            {isSeeker && (
                <>
                    <section className="form-card">
                        <h2>Education</h2>
                        {(profile?.education || []).map((item) => (
                            <div key={item._id} className="list-card">
                                <div>
                                    <strong>{item.degree}</strong>
                                    <p className="muted">{item.institution} · {item.startYear} - {item.endYear || 'Present'}</p>
                                </div>
                                <button type="button" className="btn btn-secondary" onClick={async () => {
                                    await deleteEducation(item._id);
                                    load();
                                }}>Remove</button>
                            </div>
                        ))}
                        <form onSubmit={handleEducation} className="nested-form">
                            <input placeholder="Degree" value={education.degree} onChange={(e) => setEducation({ ...education, degree: e.target.value })} />
                            <input placeholder="Institution" value={education.institution} onChange={(e) => setEducation({ ...education, institution: e.target.value })} />
                            <input placeholder="Start year" type="number" value={education.startYear} onChange={(e) => setEducation({ ...education, startYear: e.target.value })} />
                            <input placeholder="End year" type="number" value={education.endYear} onChange={(e) => setEducation({ ...education, endYear: e.target.value })} />
                            <button type="submit" className="btn btn-secondary">Add education</button>
                        </form>
                    </section>

                    <section className="form-card">
                        <h2>Experience</h2>
                        {(profile?.experience || []).map((item) => (
                            <div key={item._id} className="list-card">
                                <div>
                                    <strong>{item.position}</strong>
                                    <p className="muted">{item.company}</p>
                                    <p>{item.description}</p>
                                </div>
                                <button type="button" className="btn btn-secondary" onClick={async () => {
                                    await deleteExperience(item._id);
                                    load();
                                }}>Remove</button>
                            </div>
                        ))}
                        <form onSubmit={handleExperience} className="nested-form">
                            <input placeholder="Company" value={experience.company} onChange={(e) => setExperience({ ...experience, company: e.target.value })} />
                            <input placeholder="Position" value={experience.position} onChange={(e) => setExperience({ ...experience, position: e.target.value })} />
                            <input type="date" value={experience.startDate} onChange={(e) => setExperience({ ...experience, startDate: e.target.value })} />
                            <input type="date" value={experience.endDate} onChange={(e) => setExperience({ ...experience, endDate: e.target.value })} disabled={experience.isCurrent} />
                            <label className="checkbox">
                                <input type="checkbox" checked={experience.isCurrent} onChange={(e) => setExperience({ ...experience, isCurrent: e.target.checked, endDate: '' })} />
                                Currently working here
                            </label>
                            <textarea placeholder="Description" value={experience.description} onChange={(e) => setExperience({ ...experience, description: e.target.value })} />
                            <button type="submit" className="btn btn-secondary">Add experience</button>
                        </form>
                    </section>

                    <form className="form-card" onSubmit={handleResume}>
                        <h2>Resume</h2>
                        <label>
                            Resume URL
                            <input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://..." />
                        </label>
                        {profile?.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer">View current resume</a>}
                        <button type="submit" className="btn btn-primary">Save resume URL</button>
                    </form>
                </>
            )}
        </div>
    );
}

export default Profile;
