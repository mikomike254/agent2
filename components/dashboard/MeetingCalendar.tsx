'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Link as LinkIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Meeting {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    meeting_link?: string;
    status: string;
    type?: 'meeting' | 'milestone';
    project_title?: string;
}

export default function MeetingCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const [meetingsRes, milestonesRes] = await Promise.all([
                fetch('/api/meetings'),
                fetch('/api/milestones/upcoming')
            ]);

            const meetingsData = await meetingsRes.json();
            const milestonesData = await milestonesRes.json();

            const formattedMeetings = (meetingsData.data || []).map((m: any) => ({ ...m, type: 'meeting' }));
            const formattedMilestones = (milestonesData.data || []).map((m: any) => ({
                id: m.id,
                title: m.title,
                start_time: m.due_date,
                end_time: m.due_date,
                status: m.status,
                type: 'milestone',
                project_title: m.project?.title
            }));

            setEvents([...formattedMeetings, ...formattedMilestones]);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    };

    const getEventsForDay = (day: number) => {
        return events.filter(e => {
            const eDate = new Date(e.start_time);
            return eDate.getDate() === day && eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
        });
    };

    return (
        <Card className="p-6 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-gray-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Universal Schedule</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const hasMilestone = dayEvents.some(e => e.type === 'milestone');
                    const hasMeeting = dayEvents.some(e => e.type === 'meeting');

                    return (
                        <div key={day} className="relative group">
                            <div
                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${isToday(day)
                                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
                                    : dayEvents.length > 0
                                        ? 'bg-indigo-50 border-indigo-100 text-indigo-900 font-bold'
                                        : 'border-transparent hover:border-gray-100 bg-gray-50/50 text-gray-600'
                                    }`}
                            >
                                <span className="text-sm">{day}</span>
                                <div className="flex gap-0.5 mt-1">
                                    {hasMeeting && <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>}
                                    {hasMilestone && <div className="w-1 h-1 bg-rose-500 rounded-full"></div>}
                                </div>
                            </div>

                            {dayEvents.length > 0 && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-white p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Events: {day}th</p>
                                    <div className="space-y-2">
                                        {dayEvents.map(e => (
                                            <div key={e.id} className="text-xs">
                                                <div className="font-bold flex items-start gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${e.type === 'milestone' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                                                    <div>
                                                        <span className="block">{e.title}</span>
                                                        {e.project_title && <span className="text-[8px] text-gray-500 uppercase">{e.project_title}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Upcoming Blitz</h3>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            <span className="text-[8px] font-black text-gray-400 uppercase">Chat</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                            <span className="text-[8px] font-black text-gray-400 uppercase">Goal</span>
                        </div>
                    </div>
                </div>

                {events.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 font-medium">Clear signals today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events
                            .filter(e => new Date(e.start_time) >= new Date())
                            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                            .slice(0, 3)
                            .map(e => (
                                <div key={e.id} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-all rounded-2xl border border-gray-100 group">
                                    <div className={`w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm border ${e.type === 'milestone' ? 'border-rose-100' : 'border-gray-100'}`}>
                                        <span className={`text-[10px] font-black uppercase leading-none ${e.type === 'milestone' ? 'text-rose-500' : 'text-indigo-500'}`}>
                                            {new Date(e.start_time).toLocaleString('default', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-black text-gray-900 leading-none">
                                            {new Date(e.start_time).getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{e.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {e.type === 'milestone' ? 'Deadline' : new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {e.meeting_link && (
                                                <a href={e.meeting_link} target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline">
                                                    <LinkIcon className="w-3 h-3" />
                                                    Live
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
