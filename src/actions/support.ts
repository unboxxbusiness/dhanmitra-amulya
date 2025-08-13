

'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { SupportTicket, TicketStatus, TicketReply } from '@/lib/definitions';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { ADMIN_ROLES } from '@/lib/definitions';

const ALL_ROLES = [...ADMIN_ROLES, 'member'];

async function verifyUser(roles: string[]) {
    const session = await getSession();
    if (!session || !roles.includes(session.role)) {
        throw new Error('Not authorized for this action');
    }
    return session;
}

// --- Member Actions ---

const CreateTicketSchema = z.object({
    category: z.string(),
    subject: z.string().min(5, "Subject must be at least 5 characters long."),
    message: z.string().min(10, "Message must be at least 10 characters long."),
});

export async function createSupportTicket(prevState: any, formData: FormData) {
    const session = await verifyUser(ALL_ROLES);
    const validatedFields = CreateTicketSchema.safeParse({
        category: formData.get('category'),
        subject: formData.get('subject'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.flatten().fieldErrors };
    }
    if (!session) {
        return { success: false, error: { _form: ['Not authorized'] } };
    }

    try {
        const newTicket: Omit<SupportTicket, 'id' | 'replies'> = {
            userId: session.uid,
            userName: session.name || 'Unknown User',
            category: validatedFields.data.category as SupportTicket['category'],
            subject: validatedFields.data.subject,
            message: validatedFields.data.message,
            status: 'Open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection('supportTickets').add(newTicket);
        revalidatePath('/dashboard/support');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: { _form: ['Could not submit your ticket. Please try again.'] } };
    }
}

export async function getMemberTickets(): Promise<SupportTicket[]> {
    const session = await verifyUser(ALL_ROLES);
    if (!session) return [];
    
    const snapshot = await adminDb.collection('supportTickets')
        .where('userId', '==', session.uid)
        .orderBy('updatedAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt).toLocaleString(),
        updatedAt: new Date(doc.data().updatedAt).toLocaleString(),
    } as SupportTicket));
}


// --- Admin Actions ---

export async function getAllTickets(options: { page: number, pageSize: number }): Promise<{ tickets: SupportTicket[], totalCount: number, hasMore: boolean }> {
    await verifyUser(ADMIN_ROLES);
    const { page, pageSize } = options;

    const query = adminDb.collection('supportTickets').orderBy('updatedAt', 'desc');

    const totalSnapshot = await query.count().get();
    const totalCount = totalSnapshot.data().count;

    let paginatedQuery = query;
    if (page > 1) {
        const startAfterDoc = await query.limit((page - 1) * pageSize).get();
        const lastVisible = startAfterDoc.docs[startAfterDoc.docs.length - 1];
        paginatedQuery = query.startAfter(lastVisible);
    }

    const snapshot = await paginatedQuery.limit(pageSize).get();

    const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt).toLocaleString(),
        updatedAt: new Date(doc.data().updatedAt).toLocaleString(),
    } as SupportTicket));

    const hasMore = (page * pageSize) < totalCount;

    return { tickets, totalCount, hasMore };
}

// --- Shared Actions (Admin & Member) ---

export async function getTicketById(id: string): Promise<SupportTicket | null> {
    const session = await verifyUser(ALL_ROLES);
    const docRef = adminDb.collection('supportTickets').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const ticket = { id: doc.id, ...doc.data() } as SupportTicket;
    
    // Security check: member can only access their own tickets
    if (session && session.role === 'member' && ticket.userId !== session.uid) {
        throw new Error('You are not authorized to view this ticket.');
    }
    
    // Sort replies by date
    if (ticket.replies) {
        ticket.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return ticket;
}

const AddReplySchema = z.object({
    message: z.string().min(1, "Reply message cannot be empty."),
});

export async function addTicketReply(ticketId: string, formData: FormData) {
    const session = await verifyUser(ALL_ROLES);
    if (!session) {
      return { success: false, error: 'Not authorized.' };
    }
    const validatedFields = AddReplySchema.safeParse({
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return { success: false, error: 'Message cannot be empty.' };
    }

    try {
        const ticketRef = adminDb.collection('supportTickets').doc(ticketId);
        
        const newReply: TicketReply = {
            replyId: adminDb.collection('temp').doc().id,
            authorId: session.uid,
            authorName: session.name || 'Unknown',
            message: validatedFields.data.message,
            createdAt: new Date().toISOString(),
        };

        await ticketRef.update({
            replies: FieldValue.arrayUnion(newReply),
            updatedAt: new Date().toISOString(),
            status: 'In Progress', // Re-open ticket if it was resolved
        });
        
        revalidatePath(`/dashboard/support/${ticketId}`);
        revalidatePath(`/admin/support/${ticketId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Could not send your reply. Please try again.' };
    }
}


export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    await verifyUser(ADMIN_ROLES);
    
    try {
        const ticketRef = adminDb.collection('supportTickets').doc(ticketId);
        await ticketRef.update({
            status,
            updatedAt: new Date().toISOString(),
        });
        
        revalidatePath(`/admin/support/${ticketId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Could not update ticket status. Please try again.' };
    }
}
